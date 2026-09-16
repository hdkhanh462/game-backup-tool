# Desktop App – Game Save Backup & Restore

## 1. Mục tiêu

Ứng dụng desktop cho phép người dùng **thủ công backup và restore save game** giữa máy tính và Google Drive.

Ứng dụng **không tự động backup, không tự động restore và không cần chạy background**. Người dùng chủ động thực hiện thao tác bằng các nút **Backup** và **Restore**.

---

# 2. Tính năng chính

## 2.1. Đăng nhập Google Drive

- Đăng nhập bằng tài khoản Google thông qua OAuth.
- Hiển thị tài khoản Google hiện tại.
- Cho phép đăng xuất / đổi tài khoản.
- Kiểm tra trạng thái kết nối Google Drive.
- Chọn thư mục trên Google Drive dùng để lưu backup.

---

## 2.2. Quản lý Game

Cho phép người dùng quản lý danh sách game cần backup.

Mỗi game gồm:

- Tên game.
- Đường dẫn thư mục save local.
- Thư mục tương ứng trên Google Drive.
- Trạng thái backup gần nhất.
- Thời gian backup gần nhất.

Ví dụ:

```text
Cyberpunk 2077
Local:
C:\Users\User\Saved Games\CD Projekt Red\Cyberpunk 2077

Google Drive:
Game Save Backup/Cyberpunk 2077/
```

Các thao tác:

- Add Game.
- Edit Game.
- Remove Game.
- Open Save Folder.
- Backup.
- Restore.

Việc Remove Game **không xóa save local và không xóa backup trên Google Drive**.

---

# 3. Manual Backup

Người dùng nhấn nút **Backup** để tạo backup.

Flow:

```text
User
  ↓
Click "Backup"
  ↓
Scan Save Folder
  ↓
Prepare Backup
  ↓
Upload to Google Drive
  ↓
Backup Completed
```

### Khi backup:

- Đọc các file trong save folder.
- Xác định file cần backup.
- Upload lên Google Drive.
- Hiển thị progress.
- Hiển thị số file và dung lượng.
- Thông báo thành công hoặc lỗi.

Có thể hỗ trợ **incremental backup** để không phải upload lại những file không thay đổi.

Ví dụ:

```text
Local Save
 ├── save1.dat       unchanged → skip
 ├── save2.dat       changed   → upload
 └── settings.json   unchanged → skip
```

---

# 4. Backup Versioning

Mỗi lần người dùng nhấn **Backup**, có thể tạo một version mới.

Ví dụ:

```text
Game Save Backup/
└── Cyberpunk 2077/
    ├── 2026-09-16 13-30/
    ├── 2026-09-15 22-10/
    ├── 2026-09-14 19-45/
    └── 2026-09-12 21-20/
```

Mỗi version nên có:

- Thời gian backup.
- Device name.
- Tổng dung lượng.
- Số lượng file.
- Trạng thái backup.

Người dùng có thể chọn một version cụ thể để restore.

---

# 5. Manual Restore

Người dùng chọn một backup version và nhấn **Restore**.

Flow:

```text
User
  ↓
Select Game
  ↓
Select Backup Version
  ↓
Click "Restore"
  ↓
Confirm
  ↓
Download from Google Drive
  ↓
Restore to Local Save Folder
```

Trước khi restore nên hiển thị cảnh báo:

> Restore will overwrite files in the current save folder.

Có thể cung cấp tùy chọn:

**Backup current save before restoring**

```text
Current Save
     ↓
Safety Backup
     ↓
Restore Selected Version
```

Điều này giúp người dùng có thể quay lại trạng thái trước khi restore.

---

# 6. Backup History

Mỗi game có màn hình lịch sử backup:

```text
Cyberpunk 2077

┌────────────────────────────────────────────┐
│ Date              Size       Files         │
├────────────────────────────────────────────┤
│ Sep 16, 13:30     120 MB     45            │
│ Sep 15, 22:10     118 MB     44            │
│ Sep 14, 19:45     115 MB     43            │
└────────────────────────────────────────────┘

[ Backup Now ]

Selected:
Sep 16, 13:30

[ Restore ]
```

Cho phép:

- Xem danh sách version.
- Restore version.
- Xóa một version khỏi Google Drive.
- Refresh danh sách.

---

# 7. Backup Status

Hiển thị trạng thái rõ ràng cho từng game:

```text
✓ Backed up
Last backup: Sep 16, 13:30
```

Hoặc:

```text
⚠ Never backed up
```

Hoặc:

```text
✕ Backup failed
```

**Lưu ý:** App không tự động kiểm tra và backup khi file thay đổi. Trạng thái chỉ được cập nhật khi người dùng thực hiện thao tác hoặc refresh.

---

# 8. Google Drive Storage

Hiển thị thông tin cơ bản:

- Google account hiện tại.
- Dung lượng backup đang sử dụng.
- Dung lượng Google Drive còn lại.
- Backup folder.

Nếu upload thất bại do hết dung lượng, hiển thị lỗi rõ ràng.

---

# 9. Settings

### General

- Start application normally.
- Language.
- Theme.

### Backup

- Google Drive backup folder.
- Enable/disable incremental backup.
- Compression nếu cần.

### Restore

- Hỏi xác nhận trước khi overwrite.
- Backup save hiện tại trước khi restore.

### Google Account

- Connected account.
- Sign out.
- Connect another account.

---

# 10. UI đề xuất

Dashboard có thể rất đơn giản:

```text
┌───────────────────────────────────────────────┐
│ GameSave Backup                Google ✓       │
├───────────────────────────────────────────────┤
│                                               │
│ My Games                                      │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ 🎮 Cyberpunk 2077                         │ │
│ │ Last backup: Sep 16, 13:30                │ │
│ │                                           │ │
│ │ [ Backup ] [ Restore ] [ History ]        │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ 🎮 Stardew Valley                         │ │
│ │ Last backup: Sep 15, 21:20                │ │
│ │                                           │ │
│ │ [ Backup ] [ Restore ] [ History ]        │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│              [ + Add Game ]                   │
│                                               │
└───────────────────────────────────────────────┘
```

---

# 11. Những tính năng KHÔNG cần có

Do app chỉ hoạt động thủ công, có thể loại bỏ hoàn toàn:

- ❌ Auto backup khi save thay đổi.
- ❌ File watcher.
- ❌ Background service.
- ❌ System tray.
- ❌ Scheduled backup.
- ❌ Game process detection.
- ❌ Auto restore.
- ❌ Real-time synchronization.
- ❌ Auto conflict resolution.
- ❌ Auto game detection.

Điều này giúp app **đơn giản hơn, dễ phát triển và dễ kiểm soát dữ liệu**.

---

# 12. MVP đề xuất

Phiên bản đầu tiên chỉ cần:

1. Google OAuth.
2. Add/Edit/Remove Game.
3. Chọn local save folder.
4. Backup thủ công.
5. Upload save lên Google Drive.
6. Backup versioning.
7. Xem backup history.
8. Restore thủ công.
9. Progress bar khi upload/download.
10. Confirmation trước khi restore.
11. Safety backup trước khi overwrite.
12. Xử lý lỗi mạng / Google Drive.
13. Settings cơ bản.

### User flow tổng thể

```text
                 ┌──────────────┐
                 │    Add Game  │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │ Select Save  │
                 │    Folder    │
                 └──────┬───────┘
                        ↓
              ┌────────────────────┐
              │    Game Details    │
              └───────┬─────┬──────┘
                      ↓     ↓
                 [Backup] [Restore]
                    ↓         ↓
               Google Drive  Select
                    ↓        Version
                 Version       ↓
                    ↓       Download
                    ↓         ↓
                Completed   Local Save
```

**Core concept:** App chỉ là một công cụ **"Save → Backup" / "Backup → Save"** theo yêu cầu của người dùng, không tự động thực hiện bất kỳ thao tác đồng bộ nào.
