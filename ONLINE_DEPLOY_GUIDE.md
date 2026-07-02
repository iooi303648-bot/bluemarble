# 지구 여행 블루마블 온라인 배포 안내

학교 와이파이가 교사용 PC 접속을 막는 경우에는 로컬 주소 대신 인터넷 주소로 접속해야 합니다.
이 폴더는 Render 같은 Node.js 호스팅 서비스에 바로 올릴 수 있게 정리되어 있습니다.

## 포함 파일

- `world_blue_marble_lan_server.js`: 실시간 게임 서버
- `world_blue_marble_lan.html`: 학생/교사용 게임 화면
- `package.json`: 온라인 서버 실행 설정
- `render.yaml`: Render 배포 설정

## Render에 올리는 방식

1. 이 `outputs` 폴더 안 파일들을 GitHub 저장소에 올립니다.
2. Render에서 `New Web Service`를 선택합니다.
3. 저장소를 연결합니다.
4. 설정은 보통 자동으로 잡힙니다.
   - Build Command: `npm install`
   - Start Command: `npm start`
5. 배포가 끝나면 `https://...onrender.com` 주소가 생깁니다.
6. 교사와 학생 모두 그 주소로 접속해 참가합니다.

## 주의

무료 서버는 처음 접속할 때 잠깐 깨어나는 시간이 있을 수 있습니다.
한 반에서 여러 조가 동시에 쓰려면 조별로 배포 주소를 나누거나 방 코드 기능을 추가하는 편이 좋습니다.
