import os
from pathlib import Path
from dotenv import load_dotenv
import wikipediaapi
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

# --- Load .env ---
env_path = Path(__file__).with_name('.env')
load_dotenv(dotenv_path=env_path)

TOKEN = (os.getenv("TELEGRAM_TOKEN") or "").strip()

if not TOKEN or ":" not in TOKEN:
    raise RuntimeError(
        f"❌ TELEGRAM_TOKEN không hợp lệ hoặc không nạp được.\n"
        f"- Đang đọc .env tại: {env_path.resolve()}\n"
        f"- TOKEN loaded (masked): {TOKEN[:6]}...{TOKEN[-4:]}\n"
        "- Kiểm tra: tên biến phải là TELEGRAM_TOKEN, có dấu ':' ở giữa."
    )

# --- Wikipedia API với user_agent hợp lệ ---
wiki = wikipediaapi.Wikipedia(
    language='vi',
    user_agent='HANU-TelegramBot/1.0 (https://hanu.edu.vn; botadmin@hanu.edu.vn)'
)

# --- Lệnh /start ---
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Xin chào! Hãy hỏi tôi bất kỳ điều gì về Trường Đại học Hà Nội (theo Wikipedia)."
    )

# --- Hàm lấy toàn bộ nội dung trang Wiki ---
def get_full_wiki_text(page):
    text = page.summary + "\n"
    for section in page.sections:
        text += extract_section(section)
    return text

def extract_section(section, level=0):
    text = f"\n{' ' * (level*2)}{section.title}\n{'-' * len(section.title)}\n{section.text}\n"
    for subsection in section.sections:
        text += extract_section(subsection, level + 1)
    return text

# --- Tìm câu phù hợp với từ khoá ---
def find_answer(query, full_text, max_sentences=6):
    query = query.lower()
    sentences = full_text.split('.')
    matched = [s.strip() for s in sentences if query in s.lower()]
    if matched:
        return '. '.join(matched[:max_sentences]) + '.'
    else:
        return None

# --- Xử lý tin nhắn ---
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_message = (update.message.text or "").strip()
    if not user_message:
        await update.message.reply_text("Xin gửi câu hỏi hợp lệ.")
        return

    page = wiki.page("Trường Đại học Hà Nội")
    if not page.exists():
        await update.message.reply_text("Không tìm thấy trang Wikipedia.")
        return

    full_text = get_full_wiki_text(page)
    answer = find_answer(user_message, full_text)

    if answer:
        await update.message.reply_text(answer)
    else:
        await update.message.reply_text("Xin lỗi, tôi không tìm thấy thông tin phù hợp trong Wikipedia.")

# --- Main ---
if __name__ == '__main__':
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    print("Bot đang chạy...")
    app.run_polling()
