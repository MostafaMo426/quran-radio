#!/usr/bin/env python3
"""
Quran Radio Automated 24/7 Streamer
----------------------------------
This script fetches reciter details from the MP3Quran API, compiles their
surahs, generates a temporary playlist, and uses ffmpeg to stream the MP3s
continuously to an Icecast/Shoutcast server.

Prerequisites:
  1. python-shout is NOT needed. Standard Python library is sufficient.
  2. ffmpeg must be installed on your system and available in the system PATH.
  3. A running Icecast or Shoutcast server (you can use the provided docker-compose.yml).

Usage:
  python streamer.py --host localhost --port 8000 --password hackme --mount /live --reciter 1
"""

import os
import sys
import json
import urllib.request
import argparse
import subprocess
import tempfile
import time
import random

# API Endpoint
API_RECITERS = 'https://mp3quran.net/api/v3/reciters?language=ar'

def fetch_reciters():
    """Fetches the list of reciters and their Moshafs from MP3Quran API."""
    print("[*] fetching reciters list from MP3Quran API...")
    try:
        req = urllib.request.Request(
            API_RECITERS, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data.get('reciters', [])
    except Exception as e:
        print(f"[!] Error fetching reciters from API: {e}", file=sys.stderr)
        sys.exit(1)

def get_reciter_playlist(reciters, reciter_id=None, shuffle=False):
    """
    Selects a reciter and compiles the list of MP3 URLs for all available surahs.
    If reciter_id is None, it prompts for interactive choice, or selects one randomly if not interactive.
    """
    if not reciters:
        print("[!] No reciters data available.", file=sys.stderr)
        sys.exit(1)

    reciter = None
    if reciter_id is not None:
        # Search by ID
        reciter = next((r for r in reciters if r['id'] == reciter_id), None)
        if not reciter:
            print(f"[!] Reciter ID {reciter_id} not found. Selecting random reciter...")
    
    if not reciter:
        # If running in non-interactive shell or no id specified, choose randomly or prompt
        if sys.stdin.isatty() and reciter_id is None:
            print("\n=== اختر القارئ للبث المباشر (Select Reciter) ===")
            # Display first 20 popular reciters
            for i, r in enumerate(reciters[:30]):
                print(f"[{r['id']}] {r['name']}")
            print("...")
            try:
                choice = input("ادخل رقم القارئ واضغط Enter (أو اضغط Enter لاختيار قارئ عشوائي): ").strip()
                if choice:
                    reciter = next((r for r in reciters if str(r['id']) == choice), None)
            except (KeyboardInterrupt, SystemExit):
                sys.exit(0)
            except Exception:
                pass

        if not reciter:
            reciter = random.choice(reciters)

    print(f"\n[*] القارئ المختار للبث: {reciter['name']}")
    
    # Select the first Moshaf (narration edition) available for this reciter
    if not reciter.get('moshaf'):
        print("[!] This reciter has no audio records available.", file=sys.stderr)
        sys.exit(1)
        
    moshaf = reciter['moshaf'][0]
    print(f"[*] الرواية المختارة: {moshaf['name']}")
    print(f"[*] خادم الصوت: {moshaf['server']}")
    
    # Parse available surahs list
    surah_ids = [int(s.strip()) for s in moshaf['surah_list'].split(',') if s.strip()]
    if shuffle:
        random.shuffle(surah_ids)
    else:
        surah_ids.sort()
        
    # Compile URLs list
    playlist_urls = []
    for s_id in surah_ids:
        padded_id = str(s_id).padStart(3, '0') if hasattr(str, 'padStart') else f"{s_id:03d}"
        url = f"{moshaf['server']}{padded_id}.mp3"
        playlist_urls.append(url)
        
    return reciter['name'], moshaf['name'], playlist_urls

def create_ffmpeg_playlist_file(urls):
    """
    Creates a temporary text file matching ffmpeg's concat demuxer format.
    Requires escaping single quotes.
    """
    temp_file = tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix='.txt', encoding='utf-8')
    try:
        for url in urls:
            # Escape single quotes in URLs for ffmpeg file list
            escaped_url = url.replace("'", "'\\''")
            temp_file.write(f"file '{escaped_url}'\n")
        temp_file.flush()
        return temp_file.name
    finally:
        temp_file.close()

def run_streamer(args):
    """Launches ffmpeg to stream the compiled playlist to Icecast."""
    print("\n=======================================================")
    print("      بدء تشغيل بث راديو القرآن الكريم 24/7        ")
    print("=======================================================")
    
    reciters = fetch_reciters()
    reciter_name, moshaf_name, playlist_urls = get_reciter_playlist(
        reciters, 
        reciter_id=args.reciter, 
        shuffle=args.shuffle
    )

    print(f"[*] إجمالي السور في قائمة التشغيل: {len(playlist_urls)} سورة")
    
    # Generate the temp playlist file for ffmpeg concat
    playlist_path = create_ffmpeg_playlist_file(playlist_urls)
    print(f"[*] تم إنشاء ملف التشغيل المؤقت في: {playlist_path}")
    
    # Stream endpoint configuration
    # Format: icecast://source:password@host:port/mount
    icecast_url = f"icecast://{args.username}:{args.password}@{args.host}:{args.port}{args.mount}"
    
    # Build ffmpeg command line
    # Concat demuxer reads playlist.txt containing HTTP URLs
    ffmpeg_cmd = [
        'ffmpeg',
        '-y',
        '-re',                              # Read input in real-time (essential for broadcasting)
        '-f', 'concat',                     # Use concat demuxer
        '-safe', '0',                       # Allow arbitrary file paths/URLs
        '-protocol_whitelist', 'file,http,https,tcp,tls', # Enable remote URLs
        '-i', playlist_path,                # Input file playlist
        '-c:a', 'libmp3lame',               # Re-encode to MP3 for constant bitrate stability
        '-b:a', f'{args.bitrate}k',         # Audio Bitrate (e.g. 128k)
        '-ar', '44100',                     # Sample rate
        '-ac', '2',                         # Channels (Stereo)
        '-content_type', 'audio/mpeg',      # Mime-type headers for Icecast
        '-ice_name', f"إذاعة القرآن الكريم - تلاوة {reciter_name}",
        '-ice_description', f"بث متواصل برواية {moshaf_name} عبر خادم تلاوات MP3Quran",
        '-f', 'mp3',                        # Output format
        icecast_url                         # Icecast output target
    ]
    
    print(f"[*] عنوان البث (Icecast server): http://{args.host}:{args.port}{args.mount}")
    print(f"[*] أمر البث: {' '.join(ffmpeg_cmd)}")
    print("\n[*] جاري الاتصال بالخادم وبدء البث المباشر... اضغط Ctrl+C لإيقاف البث.")
    
    try:
        # Start ffmpeg process
        process = subprocess.Popen(
            ffmpeg_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        
        # Read ffmpeg output in real-time
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                # Log ffmpeg status updates (clean up noise)
                line = output.strip()
                if 'size=' in line or 'time=' in line:
                    # Print progress line on same line
                    sys.stdout.write(f"\r[*] البث مستمر: {line}")
                    sys.stdout.flush()
                elif 'Error' in line or 'Connection' in line or 'Server' in line:
                    print(f"\n[ffmpeg] {line}")
                    
        rc = process.poll()
        print(f"\n[*] انتهى أمر البث برمز خروج: {rc}")
        
    except KeyboardInterrupt:
        print("\n[!] تم إيقاف البث بواسطة المستخدم.")
    except Exception as e:
        print(f"\n[!] حدث خطأ غير متوقع أثناء البث: {e}", file=sys.stderr)
    finally:
        # Cleanup playlist file
        if os.path.exists(playlist_path):
            os.remove(playlist_path)
            print("[*] تم تنظيف ملفات التشغيل المؤقتة بنجاح.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Quran Radio 24/7 Automated Icecast Streamer")
    parser.add_argument('--host', default='localhost', help='Icecast server hostname/IP (default: localhost)')
    parser.add_argument('--port', type=int, default=8000, help='Icecast server port (default: 8000)')
    parser.add_argument('--username', default='source', help='Icecast source client username (default: source)')
    parser.add_argument('--password', default='hackme', help='Icecast source password (default: hackme)')
    parser.add_argument('--mount', default='/live', help='Icecast target mountpoint (default: /live)')
    parser.add_argument('--reciter', type=int, default=None, help='Reciter ID to stream (integer). If omitted, interactive selection is offered.')
    parser.add_argument('--shuffle', action='store_true', help='Shuffle the surahs playlist instead of playing sequentially')
    parser.add_argument('--bitrate', type=int, default=128, help='Output streaming bitrate in kbps (default: 128)')
    
    args = parser.parse_args()
    
    # Loop the stream forever (starts again or picks new reciter on finish/failure)
    while True:
        try:
            run_streamer(args)
            print("\n[*] ستتم إعادة تشغيل البث تلقائياً خلال 5 ثوانٍ...")
            time.sleep(5)
        except KeyboardInterrupt:
            print("\n[*] إغلاق برنامج البث. مع السلامة!")
            break
        except Exception as e:
            print(f"\n[!] خطأ في البث الرئيسي: {e}. محاولة إعادة التشغيل بعد 10 ثوانٍ...")
            time.sleep(10)
