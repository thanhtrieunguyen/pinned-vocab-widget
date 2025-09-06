# Widget Từ Vựng Nổi (Pinned Vocab Widget)

Widget nổi hiển thị và xoay vòng từ vựng lấy trực tiếp từ ứng dụng Flutter companion (`english_vocab_app`). Luôn nằm trên mọi cửa sổ khác, gọn nhẹ và cập nhật theo file dữ liệu thực tế.

## Chức năng chính

- 🌟 Luôn trên cùng (Always on Top)
- 🔄 Tự động đổi từ sau mỗi chu kỳ (mặc định 5 phút)
- �️ Kéo & thay đổi kích thước tự do
- � Thu nhỏ lại thành biểu tượng nhỏ ở góc màn hình
- ⏸️ Tạm dừng / tiếp tục xoay vòng
- 👀 Tự phát hiện thay đổi dữ liệu (watch file)
- ⚙️ Định cấu hình đường dẫn file qua biến môi trường hoặc `.env`

## Liên kết ứng dụng chính

Repo ứng dụng Flutter: https://github.com/thanhtrieunguyen/english_vocab_app  
Widget này chỉ đọc duy nhất file JSON do Flutter ghi:
```
C:\Users\<username>\AppData\Roaming\com.example\english_vocab_app\shared_preferences.json
```
Trong file đó mỗi ngày sẽ có khóa dạng: `flutter.vocabulary_data_YYYY-MM-DD` chứa danh sách từ (dạng chuỗi JSON bên trong).

## Cấu hình đường dẫn (tùy chọn)

Nếu muốn dùng file khác (cùng cấu trúc), đặt biến môi trường hoặc tạo file `.env` trong thư mục dự án:
```
VOCAB_PATH=D:\\Users\\<user>\\Desktop\\english_vocab_app\\shared_preferences.json
# hoặc
VOCAB_JSON=D:\\data\\another_shared_preferences.json
```
Trên Windows CMD chạy tạm thời:
```
set VOCAB_PATH=D:\\Users\\trieunth\\Desktop\\english_vocab_app\\shared_preferences.json && npm start
```

Ứng dụng kiểm tra lại đường dẫn mỗi lần renderer yêu cầu dữ liệu. Nếu chưa có file sẽ trả về lỗi để bạn mở app Flutter tạo dữ liệu.

## Cài đặt & chạy

1. Yêu cầu: Node.js >= 16
2. Cài dependency:
   ```
   npm install
   ```
3. Chạy chế độ dev (có DevTools khi đặt NODE_ENV=development):
   ```
   npm run dev
   ```
4. Chạy bình thường:
   ```
   npm start
   ```
5. Đóng gói (tạo installer trong thư mục `dist/`):
   ```
   npm run build
   ```

## Sử dụng

1. Mở ứng dụng Flutter để nó tạo/ghi `shared_preferences.json`.
2. Chạy widget.
3. Widget tự lấy ngày hiện tại → đọc khóa tương ứng → hiển thị danh sách từ.
4. Không có dữ liệu ngày hiện tại: sẽ lấy ngày gần nhất có dữ liệu.

## Điều khiển giao diện

- Ghim (pin): bật/tắt luôn-on-top.
- Thu nhỏ: biến thành ô vuông nhỏ ở góc.
- Đóng: thoát ứng dụng.
- Nút trước / sau: chuyển từ thủ công.
- Tạm dừng: dừng tự xoay vòng (bấm lại để tiếp tục).

## Tùy chỉnh

Thời gian xoay vòng: sửa trong `renderer/script.js`:
```javascript
this.rotationInterval = 5 * 60 * 1000; // 5 phút
```
Giao diện: chỉnh màu / font / animation trong `renderer/styles.css`.

## Kiến trúc kỹ thuật

- Electron (main process: `main.js`)
- Renderer: HTML + CSS + JS thuần
- Theo dõi file: thư viện `chokidar`
- IPC: lấy dữ liệu từ main → renderer
- Không còn fallback demo – chỉ dùng file thật

## Cấu trúc thư mục

```
project/
├── main.js
├── package.json
├── renderer/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── assets/
│   └── icon.png (hoặc icon khác)
└── README.md
```

## Lỗi thường gặp

### "Vocabulary file not found"
– Chưa có file `shared_preferences.json` (mở app Flutter).  
– Sai đường dẫn ENV.  

### "No vocabulary data found"
– File có nhưng không có khóa ngày hoặc nội dung rỗng.  
– Định dạng giá trị không phải JSON hợp lệ.

### Không cập nhật khi thay đổi
– Kiểm tra quyền ghi của hệ thống.  
– Đảm bảo app Flutter thực sự ghi lại file (đóng/mở app để flush).  

## Phát triển

Chạy DevTools: đặt `NODE_ENV=development` rồi `npm run dev`.

Thêm tính năng:
1. UI → `renderer/index.html`
2. Style → `renderer/styles.css`
3. Logic hiển thị → `renderer/script.js`
4. Xử lý nền / đọc file → `main.js`

## Đóng góp

1. Fork
2. Tạo nhánh mới
3. Commit thay đổi
4. Mở Pull Request

## Giấy phép

MIT – tự do sử dụng và chỉnh sửa.

---

Chúc học từ hiệu quả! 📚
