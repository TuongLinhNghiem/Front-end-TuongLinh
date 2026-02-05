import os
import zipfile
import requests
from vncorenlp import VnCoreNLP

VNCORENLP_URL = "https://github.com/vncorenlp/VnCoreNLP/archive/refs/heads/master.zip"
VNCORENLP_DIR = "VnCoreNLP"

# Từ khóa intent
KEYWORDS = {
    "mon_hoc": ["môn học", "học phần", "lớp học"],
    "lich_thi": ["lịch thi", "ngày thi", "thi cử"],
    "thong_tin_truong": ["đại học hà nội", "hanu", "thông tin trường"]
}

def setup_vncorenlp():
    """Tự động tải & giải nén VnCoreNLP nếu chưa có."""
    if os.path.exists(VNCORENLP_DIR):
        return  # Đã tồn tại

    print("⬇️ Đang tải VnCoreNLP...")
    r = requests.get(VNCORENLP_URL)
    with open("vncorenlp.zip", "wb") as f:
        f.write(r.content)

    print("📦 Đang giải nén...")
    with zipfile.ZipFile("vncorenlp.zip", "r") as zip_ref:
        zip_ref.extractall(".")

    os.rename("VnCoreNLP-master", VNCORENLP_DIR)
    os.remove("vncorenlp.zip")
    print("✅ Hoàn tất setup VnCoreNLP.")

# Chạy setup khi import module
setup_vncorenlp()

# Khởi tạo annotator
annotator = VnCoreNLP(
    f"{VNCORENLP_DIR}/VnCoreNLP-1.1.1.jar",
    annotators="wseg,pos,ner,parse",
    max_heap_size='-Xmx2g'
)

def detect_intent(text: str) -> str:
    """
    Nhận câu tiếng Việt, phân tích với VnCoreNLP và trả về intent.
    Nếu không khớp -> trả về "unknown".
    """
    segmented = annotator.tokenize(text)
    flat_tokens = [token.lower() for sentence in segmented for token in sentence]

    for intent, keywords in KEYWORDS.items():
        for kw in keywords:
            if kw in " ".join(flat_tokens):
                return intent
    return "unknown"
