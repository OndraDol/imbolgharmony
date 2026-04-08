"""
Helper pro parsování Facebook foto metadat.
Spouští se z CLI pro zpracování dat získaných přes Playwright.
"""
import json, re, os, sys, glob
from datetime import datetime

MONTHS_EN = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12
}

def parse_date(date_text):
    """
    Převádí Facebook datum text na YYYY-MM-DD HH:MM:SS
    Příklady: "26 March at 08:27", "5 January 2025 at 14:30"
    """
    date_text = str(date_text).strip()

    # Unix timestamp (integer)
    if date_text.isdigit():
        import datetime
        d = datetime.datetime.fromtimestamp(int(date_text), tz=datetime.timezone.utc)
        return d.strftime('%Y-%m-%d %H:%M:%S')

    # Pattern: "DD Month YYYY at HH:MM"
    m = re.match(r'(\d{1,2})\s+(\w+)\s+(\d{4})\s+at\s+(\d{2}):(\d{2})', date_text, re.I)
    if m:
        day, month_str, year, hour, minute = m.groups()
        month = MONTHS_EN.get(month_str.lower())
        if month:
            return f"{year}-{month:02d}-{int(day):02d} {hour}:{minute}:00"
    # Pattern: "DD Month at HH:MM" (current year = 2026)
    m = re.match(r'(\d{1,2})\s+(\w+)\s+at\s+(\d{2}):(\d{2})', date_text, re.I)
    if m:
        day, month_str, hour, minute = m.groups()
        month = MONTHS_EN.get(month_str.lower())
        if month:
            year = 2026
            return f"{year}-{month:02d}-{int(day):02d} {hour}:{minute}:00"
    return date_text


def parse_caption(full_text_concat):
    """
    Extrahuje caption z concatenated textu získaného přes TreeWalker.
    Text má formát: ...·[music]·[artist]·Shared with Public<CAPTION>NComments...
    """
    if not full_text_concat:
        return ''

    text = full_text_concat

    # Odstraníme privacy indicator
    PRIVACY_PATTERNS = ['Shared with Public', 'Public', 'Friends', 'Only me', 'Only You']
    for pp in PRIVACY_PATTERNS:
        text = text.replace(pp, '')

    # Strategie: najít text MEZI posledním "·" a "NComments" nebo "No comments yet"
    # Použijeme regex - hledáme text po posledním "·" před comments sekcí
    m = re.search(r'·([^·]*?)(?=\s*\d+\s*(?:Most relevant|Comments|Comment)|\s*No comments yet)',
                  text, re.DOTALL)
    candidates = re.findall(r'·([^·]*?)(?=\s*\d+\s*(?:Most relevant|Comments|Comment)|\s*No comments yet)',
                            text, re.DOTALL)

    caption = ''
    if candidates:
        # Bereme poslední kandidát (nejblíže k comments sekci)
        candidate = candidates[-1].strip()
        # Odstraníme věci které nejsou caption: jména interpretů, songy apod.
        # Caption je v češtině, nebo aspoň má víc než jedno slovo
        # Skip pokud je to jen jméno interpreta (krátké, bez diakritiky = eng)
        # Nebo pokud začíná číslem (reaction count)
        if re.match(r'^\d', candidate):
            caption = ''
        elif len(candidate) < 3:
            caption = ''
        else:
            # Check if it's actual Czech/meaningful content (not song/artist names that snuck in)
            # Song names are usually short English phrases
            # Real captions tend to be longer Czech text
            lines = [l.strip() for l in candidate.split('\n') if l.strip()]
            # Filter out the privacy/music noise
            filtered = []
            for line in lines:
                # Skip if it looks like a song name (e.g. "Style (Taylor's Version)")
                if re.match(r'^[\w\s\'\(\)\-:]+$', line) and len(line) < 50 and not any(c in line for c in 'áéíóúůěščřžýďňáéíóúůěščřžýď'):
                    continue
                filtered.append(line)
            caption = '\n'.join(filtered).strip()

    # Fallback: hledej česky znějící text (s diakritikou) po "·"
    if not caption:
        m = re.search(r'·\s*([A-ZÁÉÍÓÚŮĚŠČŘŽÝĎ\w][^·]*?)(?:\d+(?:Most relevant)?Comments|\d+CommentsNo comments yet|No comments yet)',
                      text, re.DOTALL)
        if m:
            candidate = m.group(1).strip()
            # Odmítni pokud začíná číslem nebo je příliš krátký
            if not re.match(r'^\d', candidate) and len(candidate) > 5:
                caption = candidate

    # Finální cleanup
    caption = re.sub(r'\s+', ' ', caption).strip()
    # Odstranit trailing/leading noise
    caption = re.sub(r'^(Taylor Swift|Style.*?Version.*?)\s*', '', caption).strip()

    return caption


def extract_filename_from_url(url):
    """Extrahuje filename bez extension z CDN URL."""
    m = re.search(r'/([^/?]+)\.(jpg|jpeg|png)', url, re.I)
    if m:
        return m.group(1)
    return ''


def save_photo_json(photo_id, img_url, date_text, caption, gallery_mapping, output_dir='facebook/photos'):
    """Uloží JSON metadata pro fotku."""
    mapping = gallery_mapping.get(photo_id, {})

    data = {
        'id': photo_id,
        'set_id': 'pb.61571597523226.-2207520000',
        'username': 'Imbolg Harmony ',
        'user_id': '61571597523226',
        'user_pfbid': '',
        'caption': caption,
        'date': parse_date(date_text) if date_text else '',
        'url': img_url,
        'next_photo_id': mapping.get('next_photo_id', ''),
        'filename': extract_filename_from_url(img_url),
        'extension': 'jpg',
        'followups_ids': [],
        'num': mapping.get('num', 0),
        'title': "Imbolg Harmony 's Photos",
        'first_photo_id': mapping.get('first_photo_id', '122159709440719917'),
        'category': 'facebook',
        'subcategory': 'photos'
    }

    path = os.path.join(output_dir, f'{photo_id}.jpg.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    return path


if __name__ == '__main__':
    # Test parse_caption
    test_text = "This photo is from a post.View PostImbolg Harmony Sspoenrodt2r899021af86 c7fhM10g:ac6 821a8f07a7l34c427tt13 51  · ﻿Clocks (Sign of the Times Remix)  · Ituana  · Shared with PublicLeo (Leo) – Malý král 👑Symbolizuje vrozenou sílu, odvahu a ušlechtilost. Přirozený vůdce, který svou přítomností chrání celou smečku.4CommentsNo comments yetBe the first to comment.Comment as Ondra Dolejš"
    caption = parse_caption(test_text)
    print(f"Caption: {repr(caption)}")

    test_date = "26 March at 08:27"
    print(f"Date: {parse_date(test_date)}")
