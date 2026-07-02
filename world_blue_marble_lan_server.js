const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = Number(process.env.PORT || 8765);
const ROOT = __dirname;

const colors = ["#e44c65", "#1f9d72", "#1677c7", "#f4b63d", "#7b61d1", "#293241"];
const boardSpaces = [
  {type:"start", name:"출발", meta:"한 바퀴마다 월급 20"},
  {type:"quiz", name:"위도", meta:"적도와 남북 위치"},
  {type:"country", name:"대한민국", continent:"아시아", meta:"반도에 있는 우리나라"},
  {type:"ocean", name:"태평양", meta:"가장 넓은 대양"},
  {type:"country", name:"일본", continent:"아시아", meta:"섬나라"},
  {type:"chance", name:"황금열쇠", meta:"지구본, 지도, 영상"},
  {type:"country", name:"중국", continent:"아시아", meta:"넓은 영토"},
  {type:"quiz", name:"경도", meta:"본초 자오선"},
  {type:"continent", name:"아시아", meta:"가장 큰 대륙"},
  {type:"country", name:"사우디아라비아", continent:"아시아", meta:"건조한 지역"},
  {type:"ocean", name:"인도양", meta:"아시아 남쪽"},
  {type:"country", name:"이집트", continent:"아프리카", meta:"나일강과 사막"},
  {type:"island", name:"무인도", meta:"3턴 동안 갇혀요"},
  {type:"country", name:"케냐", continent:"아프리카", meta:"동아프리카"},
  {type:"continent", name:"아프리카", meta:"적도가 지나감"},
  {type:"chance", name:"황금열쇠", meta:"이동 카드"},
  {type:"country", name:"프랑스", continent:"유럽", meta:"유럽 서쪽"},
  {type:"space", name:"우주여행", meta:"콜롬비아호 발사"},
  {type:"country", name:"영국", continent:"유럽", meta:"섬나라"},
  {type:"ocean", name:"대서양", meta:"유럽과 아메리카 사이"},
  {type:"country", name:"미국", continent:"북아메리카", meta:"대서양과 태평양 사이"},
  {type:"continent", name:"북아메리카", meta:"북반구에 넓게 위치"},
  {type:"fund_pay", name:"기금 접수처", meta:"사회복지기금 15 납부"},
  {type:"country", name:"캐나다", continent:"북아메리카", meta:"북쪽의 넓은 나라"},
  {type:"chance", name:"황금열쇠", meta:"도장 기회"},
  {type:"country", name:"브라질", continent:"남아메리카", meta:"아마존 지역"},
  {type:"continent", name:"남아메리카", meta:"남북으로 길다"},
  {type:"ocean", name:"남극해", meta:"남극 대륙 주변"},
  {type:"continent", name:"남극 대륙", meta:"얼음으로 덮인 대륙"},
  {type:"country", name:"오스트레일리아", continent:"오세아니아", meta:"대륙이자 나라"},
  {type:"fund_take", name:"기금 수령처", meta:"쌓인 기금을 모두 받아요"},
  {type:"continent", name:"오세아니아", meta:"섬들이 많음"}
];

const cards = [
  {q:"위도는 무엇을 기준으로 남쪽과 북쪽의 위치를 나타낼까요?", a:["적도", "본초 자오선", "날짜 변경선"], c:0, e:"위도는 적도를 기준으로 북위와 남위로 나타냅니다."},
  {q:"경도는 무엇을 기준으로 동쪽과 서쪽의 위치를 나타낼까요?", a:["본초 자오선", "남극점", "태평양"], c:0, e:"경도는 본초 자오선을 기준으로 동경과 서경으로 나타냅니다."},
  {q:"세계 지도에서 위도와 경도는 어떤 일을 도와줄까요?", a:["위치를 더 정확히 찾는다", "날씨를 바꾼다", "나라 이름을 만든다"], c:0, e:"위선과 경선을 이용하면 나라나 도시의 위치를 더 정확히 말할 수 있습니다."},
  {q:"지구본의 좋은 점으로 알맞은 것은?", a:["지구의 둥근 모양을 실제와 비슷하게 볼 수 있다", "모든 지역을 한눈에 자세히 볼 수 있다", "계속 확대할 수 있다"], c:0, e:"지구본은 지구의 둥근 모양과 위치 관계를 이해하는 데 좋습니다."},
  {q:"세계 지도의 좋은 점으로 알맞은 것은?", a:["세계 여러 지역을 한눈에 볼 수 있다", "지구가 실제로 평평하다는 것을 보여 준다", "높이를 정확히 만져 볼 수 있다"], c:0, e:"세계 지도는 넓은 지역을 한눈에 비교하기 좋습니다."},
  {q:"디지털 공간 영상 정보의 특징으로 알맞은 것은?", a:["확대, 축소, 이동하며 위치를 살펴볼 수 있다", "종이에 한 번 그리면 바꿀 수 없다", "위도와 경도를 사용할 수 없다"], c:0, e:"디지털 지도와 위성 영상은 확대와 축소, 검색, 거리 확인 등에 활용됩니다."},
  {q:"대륙은 무엇을 뜻할까요?", a:["바다로 둘러싸인 아주 큰 땅덩어리", "작은 강", "나라의 수도"], c:0, e:"대륙은 지구 표면의 아주 큰 땅덩어리입니다."},
  {q:"대양은 무엇을 뜻할까요?", a:["대륙 사이에 펼쳐진 넓은 바다", "산맥", "도시의 길"], c:0, e:"태평양, 대서양, 인도양처럼 큰 바다를 대양이라고 합니다."},
  {q:"세계에서 가장 넓은 대륙은?", a:["아시아", "유럽", "오세아니아"], c:0, e:"아시아는 세계에서 가장 넓은 대륙입니다."},
  {q:"세계에서 가장 넓은 대양은?", a:["태평양", "인도양", "남극해"], c:0, e:"태평양은 세계에서 가장 넓은 대양입니다."},
  {q:"오스트레일리아에 대한 설명으로 알맞은 것은?", a:["오세아니아에 있으며 대륙이자 나라이다", "유럽의 작은 반도 국가이다", "남극 대륙에 있다"], c:0, e:"오스트레일리아는 오세아니아에 있는 나라로, 대륙 이름으로도 쓰입니다."},
  {q:"나라의 영토 특징을 살펴볼 때 볼 수 있는 내용은?", a:["위치, 크기, 모양, 이웃한 나라", "좋아하는 음식만", "학생 수만"], c:0, e:"영토 특징은 위치, 크기, 모양, 주변 나라와 바다 등을 함께 살펴봅니다."},
  {q:"대한민국과 일본의 공통점으로 알맞은 것은?", a:["아시아에 있다", "남극 대륙에 있다", "대서양 한가운데 있다"], c:0, e:"대한민국과 일본은 모두 아시아에 있습니다."},
  {q:"브라질이 있는 대륙은?", a:["남아메리카", "유럽", "아프리카"], c:0, e:"브라질은 남아메리카에 있는 큰 나라입니다."},
  {q:"프랑스가 있는 대륙은?", a:["유럽", "오세아니아", "남극 대륙"], c:0, e:"프랑스는 유럽에 있습니다."},
  {q:"케냐와 이집트가 있는 대륙은?", a:["아프리카", "북아메리카", "아시아"], c:0, e:"케냐와 이집트는 아프리카에 있습니다."},
  {q:"세계 여러 나라를 비교할 때 먼저 살펴보면 좋은 자료는?", a:["세계 지도와 디지털 지도", "동화책 표지만", "운동장 시간표"], c:0, e:"지도와 디지털 공간 자료를 활용하면 위치와 영토 특징을 비교할 수 있습니다."},
  {q:"적도에 대한 설명으로 알맞은 것은?", a:["지구를 북반구와 남반구로 나누는 기준선", "동쪽과 서쪽을 나누는 기준선", "나라의 경계선"], c:0, e:"적도는 위도 0도이며 북반구와 남반구를 나누는 기준입니다."},
  {q:"본초 자오선에 대한 설명으로 알맞은 것은?", a:["경도 0도의 기준선", "위도 90도의 선", "대륙 이름"], c:0, e:"본초 자오선은 경도 0도의 기준입니다."},
  {q:"남극 대륙에 대한 설명으로 알맞은 것은?", a:["대부분 얼음으로 덮여 있다", "세계에서 가장 더운 사막만 있다", "여러 나라의 수도가 모여 있다"], c:0, e:"남극 대륙은 대부분 얼음으로 덮여 있고, 연구 활동이 이루어집니다."},
  {q:"위선은 어느 방향으로 그어진 선일까요?", a:["가로(동서) 방향", "세로(남북) 방향", "대각선 방향"], c:0, e:"위선은 가로로 그어진 선으로 위도를 나타냅니다."},
  {q:"경선은 어느 방향으로 그어진 선일까요?", a:["세로(남북) 방향", "가로(동서) 방향", "곡선 방향"], c:0, e:"경선은 세로로 그어진 선으로 경도를 나타냅니다."},
  {q:"북위와 남위를 나누는 기준이 되는 위도는?", a:["0도(적도)", "90도", "180도"], c:0, e:"적도는 위도 0도이며 북위와 남위를 나눕니다."},
  {q:"동경과 서경을 나누는 기준이 되는 경도는?", a:["0도(본초 자오선)", "90도", "60도"], c:0, e:"본초 자오선은 경도 0도이며 동경과 서경을 나눕니다."},
  {q:"위도가 높아질수록(적도에서 멀어질수록) 나타나는 일반적인 특징은?", a:["기온이 낮아지는 경향이 있다", "항상 비가 많이 온다", "바다가 사라진다"], c:0, e:"일반적으로 적도에서 극지방으로 갈수록 기온이 낮아지는 경향이 있습니다."},
  {q:"대한민국은 적도를 기준으로 어느 쪽에 있을까요?", a:["북반구", "남반구", "적도 바로 위"], c:0, e:"대한민국은 북반구, 북위 약 33~43도에 있습니다."},
  {q:"세계 지도의 단점으로 알맞은 것은?", a:["둥근 지구를 평면으로 나타내 실제와 다른 부분이 있다", "가지고 다니기 불편하다", "한 번에 좁은 지역만 볼 수 있다"], c:0, e:"세계 지도는 둥근 지구를 평면에 옮기는 과정에서 크기나 모양이 실제와 달라지는 부분이 있습니다."},
  {q:"지구본의 단점으로 알맞은 것은?", a:["한 번에 앞면만 볼 수 있어 뒷면은 돌려야 한다", "확대와 축소가 자유롭다", "실제 모습과 매우 다르게 생겼다"], c:0, e:"지구본은 입체 모형이라 한 번에 전체를 다 볼 수 없어 돌려 가며 봐야 합니다."},
  {q:"아시아에 속한 나라가 아닌 것은?", a:["프랑스", "대한민국", "중국"], c:0, e:"프랑스는 유럽에 있는 나라입니다."},
  {q:"아프리카 대륙에 대한 설명으로 알맞은 것은?", a:["적도가 지나가며 사막과 초원이 있다", "일 년 내내 눈이 덮여 있다", "섬으로만 이루어져 있다"], c:0, e:"아프리카는 적도가 지나가며 사막, 초원 등 다양한 환경이 있습니다."},
  {q:"유럽 대륙의 특징으로 알맞은 것은?", a:["여러 나라가 비교적 가깝게 모여 있다", "세계에서 가장 넓은 대륙이다", "적도가 지나간다"], c:0, e:"유럽은 다른 대륙보다 여러 나라가 가깝게 모여 있습니다."},
  {q:"북아메리카에 있는 나라로 알맞은 것은?", a:["미국, 캐나다", "브라질, 아르헨티나", "이집트, 케냐"], c:0, e:"미국과 캐나다는 북아메리카에 있습니다."},
  {q:"남아메리카 대륙의 특징으로 알맞은 것은?", a:["남북으로 길게 뻗어 있다", "가장 작은 대륙이다", "얼음으로만 덮여 있다"], c:0, e:"남아메리카는 남북으로 길게 뻗은 대륙입니다."},
  {q:"오세아니아 지역의 특징으로 알맞은 것은?", a:["오스트레일리아 대륙과 여러 섬나라로 이루어져 있다", "남극 대륙과 붙어 있다", "세계에서 인구가 가장 많은 대륙이다"], c:0, e:"오세아니아는 오스트레일리아 대륙과 뉴질랜드 등 여러 섬나라로 이루어져 있습니다."},
  {q:"남극 대륙에는 어떤 나라가 있을까요?", a:["나라가 없고 여러 나라가 연구 기지를 운영한다", "50개가 넘는 나라가 있다", "한 나라만 있다"], c:0, e:"남극 대륙은 특정 나라의 영토가 아니며 여러 나라가 연구 기지를 두고 있습니다."},
  {q:"태평양과 맞닿아 있지 않은 대륙은?", a:["유럽", "아시아", "오세아니아"], c:0, e:"유럽은 태평양과 맞닿아 있지 않습니다."},
  {q:"대서양을 사이에 둔 두 대륙으로 알맞은 것은?", a:["유럽과 아메리카", "아시아와 아프리카", "오세아니아와 남극 대륙"], c:0, e:"대서양은 유럽·아프리카와 아메리카 대륙 사이에 있습니다."},
  {q:"인도양과 가까운 대륙이 아닌 것은?", a:["북아메리카", "아시아", "아프리카"], c:0, e:"북아메리카는 인도양과 맞닿아 있지 않습니다."},
  {q:"남극해에 대한 설명으로 알맞은 것은?", a:["남극 대륙을 둘러싼 차가운 바다이다", "적도 근처의 따뜻한 바다이다", "세계에서 가장 넓은 대양이다"], c:0, e:"남극해는 남극 대륙 주변을 둘러싼 차가운 바다입니다."},
  {q:"대한민국의 수도는 어디일까요?", a:["서울", "도쿄", "베이징"], c:0, e:"대한민국의 수도는 서울입니다."},
  {q:"대한민국이 자리한 반도의 이름은?", a:["한반도", "이베리아반도", "인도차이나반도"], c:0, e:"대한민국은 한반도에 있습니다."},
  {q:"일본의 지형적 특징으로 알맞은 것은?", a:["여러 개의 섬으로 이루어진 섬나라이다", "바다가 없는 내륙국이다", "아프리카 대륙에 속한다"], c:0, e:"일본은 여러 섬으로 이루어진 섬나라입니다."},
  {q:"대한민국과 일본 사이에 있는 바다는?", a:["동해", "지중해", "홍해"], c:0, e:"대한민국과 일본 사이에는 동해가 있습니다."},
  {q:"중국에 대한 설명으로 알맞은 것은?", a:["인구가 매우 많고 영토가 넓다", "섬나라이다", "남아메리카에 있다"], c:0, e:"중국은 인구가 세계에서 가장 많고 영토도 매우 넓은 나라입니다."},
  {q:"중국과 이웃한 나라로 알맞은 것은?", a:["몽골", "캐나다", "케냐"], c:0, e:"몽골은 중국과 국경을 맞대고 있는 나라입니다."},
  {q:"사우디아라비아의 자연환경으로 알맞은 것은?", a:["사막이 넓게 펼쳐진 건조 기후이다", "일 년 내내 눈이 내린다", "열대 우림이 울창하다"], c:0, e:"사우디아라비아는 건조 기후로 사막이 넓게 나타납니다."},
  {q:"사우디아라비아가 있는 대륙은?", a:["아시아", "아프리카", "유럽"], c:0, e:"사우디아라비아는 아시아 서남부(중동)에 있습니다."},
  {q:"이집트를 가로지르는 강의 이름은?", a:["나일강", "아마존강", "황허강"], c:0, e:"이집트에는 나일강이 흐르며 강 주변에 사람들이 많이 모여 삽니다."},
  {q:"이집트의 자연환경으로 알맞은 것은?", a:["사막이 넓고 나일강 주변에 사람이 모여 산다", "울창한 밀림으로 덮여 있다", "화산섬으로 이루어져 있다"], c:0, e:"이집트는 대부분 사막이며 나일강 주변에 도시가 발달했습니다."},
  {q:"케냐가 있는 위치로 알맞은 것은?", a:["아프리카 동부", "아시아 동부", "유럽 남부"], c:0, e:"케냐는 아프리카 동부에 있습니다."},
  {q:"케냐에 대한 설명으로 알맞은 것은?", a:["초원이 넓어 야생 동물이 많이 산다", "일 년 내내 눈이 쌓여 있다", "섬나라이다"], c:0, e:"케냐는 넓은 초원에 다양한 야생 동물이 사는 것으로 유명합니다."},
  {q:"프랑스의 수도는?", a:["파리", "런던", "로마"], c:0, e:"프랑스의 수도는 파리입니다."},
  {q:"프랑스의 대표적인 문화유산으로 알려진 탑은?", a:["에펠탑", "자유의 여신상", "피라미드"], c:0, e:"에펠탑은 프랑스 파리에 있는 대표적인 건축물입니다."},
  {q:"영국의 지형적 특징은?", a:["유럽 대륙 옆에 있는 섬나라이다", "아시아 대륙 한가운데 있다", "적도 바로 아래에 있다"], c:0, e:"영국은 유럽 대륙 옆에 있는 섬나라입니다."},
  {q:"영국의 수도는?", a:["런던", "파리", "베를린"], c:0, e:"영국의 수도는 런던입니다."},
  {q:"미국의 위치로 알맞은 것은?", a:["북아메리카에 있으며 태평양과 대서양 사이에 있다", "남아메리카 남쪽 끝에 있다", "아시아 대륙에 속한다"], c:0, e:"미국은 북아메리카에 있으며 서쪽은 태평양, 동쪽은 대서양과 맞닿아 있습니다."},
  {q:"미국의 수도는?", a:["워싱턴 D.C.", "뉴욕", "로스앤젤레스"], c:0, e:"미국의 수도는 워싱턴 D.C.이며, 뉴욕은 가장 큰 도시입니다."},
  {q:"캐나다에 대한 설명으로 알맞은 것은?", a:["북아메리카 북쪽에 있는 영토가 넓은 나라이다", "섬나라이다", "적도가 지나간다"], c:0, e:"캐나다는 북아메리카 북쪽에 있는 영토가 매우 넓은 나라입니다."},
  {q:"캐나다와 국경을 맞댄 나라는?", a:["미국", "브라질", "프랑스"], c:0, e:"캐나다는 남쪽으로 미국과 국경을 맞대고 있습니다."},
  {q:"브라질을 흐르는 세계적으로 유명한 강은?", a:["아마존강", "나일강", "황허강"], c:0, e:"브라질에는 세계에서 손꼽히게 큰 아마존강이 흐릅니다."},
  {q:"브라질에서 널리 쓰이는 언어는?", a:["포르투갈어", "스페인어", "영어"], c:0, e:"브라질은 남아메리카에서 포르투갈어를 쓰는 대표적인 나라입니다."},
  {q:"오스트레일리아의 수도는?", a:["캔버라", "시드니", "멜버른"], c:0, e:"오스트레일리아의 수도는 캔버라이며, 시드니는 가장 큰 도시입니다."},
  {q:"오스트레일리아에 사는 동물로 널리 알려진 것은?", a:["캥거루", "판다", "북극곰"], c:0, e:"캥거루는 오스트레일리아를 대표하는 동물입니다."},
  {q:"나라와 나라 사이의 경계선을 무엇이라고 할까요?", a:["국경", "적도", "위선"], c:0, e:"국경은 나라와 나라 사이를 나누는 경계선입니다."},
  {q:"영토의 모양을 살펴볼 때 함께 알아보면 좋은 것은?", a:["주변에 있는 바다와 이웃 나라", "그 나라 사람들의 이름", "학교 급식 메뉴"], c:0, e:"영토 특징은 주변 바다, 이웃 나라 등과 함께 살펴보면 좋습니다."},
  {q:"섬나라의 특징으로 알맞은 것은?", a:["사방이 바다로 둘러싸여 있다", "다른 나라와 국경을 맞대고 있다", "바다가 전혀 없다"], c:0, e:"섬나라는 사방이 바다로 둘러싸인 나라입니다."},
  {q:"바다와 접하지 않는 내륙국의 특징으로 알맞은 것은?", a:["사방이 육지로 둘러싸여 있다", "사방이 바다로 둘러싸여 있다", "남극에 있는 나라이다"], c:0, e:"내륙국은 바다와 맞닿지 않고 사방이 다른 나라(육지)로 둘러싸인 나라입니다."},
  {q:"세계 여러 나라의 영토 모양이 서로 다른 까닭과 관련 있는 것은?", a:["나라마다 위치와 자연환경이 다르기 때문이다", "모든 나라가 같은 모양이기 때문이다", "지도를 그린 사람이 마음대로 정했기 때문이다"], c:0, e:"나라마다 위치와 자연환경이 달라 영토의 모양과 크기도 다양합니다."},
  {q:"다음 중 대양이 아닌 것은?", a:["아시아", "태평양", "대서양"], c:0, e:"아시아는 대륙이고, 태평양과 대서양은 대양입니다."},
  {q:"다음 중 대륙이 아닌 것은?", a:["인도양", "아프리카", "유럽"], c:0, e:"인도양은 대양이고, 아프리카와 유럽은 대륙입니다."},
  {q:"세계에서 가장 작은 대륙은?", a:["오세아니아", "아시아", "아프리카"], c:0, e:"오세아니아는 대륙 중 면적이 가장 작습니다."},
  {q:"세계 여러 나라를 나라별로 비교해 보면 좋은 점은?", a:["공통점과 차이점을 알 수 있다", "모든 나라가 똑같다는 것을 알 수 있다", "지도가 필요 없다는 것을 알 수 있다"], c:0, e:"나라별로 비교하면 서로 다른 자연환경과 문화의 공통점·차이점을 알 수 있습니다."}
];

const chanceCards = [
  {title:"위성 영상 확인", text:"디지털 지도를 확대해 정확한 위치를 찾았습니다. 2마일리지를 얻습니다.", score:2},
  {title:"경도 헷갈림", text:"동경과 서경을 바꾸어 적었습니다. 다음 차례에 주사위가 1 줄어듭니다.", penalty:"slow"},
  {title:"대양 항해", text:"태평양을 건너 넓은 바다를 체험했습니다. 앞으로 3칸 이동합니다.", move:3},
  {title:"세계 지도 완성", text:"대륙과 대양 이름을 잘 정리했습니다. 3마일리지를 얻습니다.", score:3},
  {title:"길 잃은 여행자", text:"위도와 경도 표시를 다시 확인합니다. 뒤로 2칸 이동합니다.", move:-2},
  {title:"친구 설명", text:"나라의 위치와 영토 특징을 친구에게 설명했습니다. 나라 도장 1개가 있으면 2마일리지를 얻습니다.", stampScore:2},
  {title:"탐험 보고서", text:"지도, 지구본, 디지털 영상 자료의 장점을 비교했습니다. 2마일리지를 얻습니다.", score:2},
  {title:"출발점 비행", text:"공항으로 이동합니다. 출발점으로 이동하고 1마일리지를 얻습니다.", goStart:true},
  {title:"무인도 탈출권 획득", text:"다음에 무인도에 갇히면 바로 탈출할 수 있는 카드를 얻었습니다.", islandEscape:true}
];

const BUILD_COST = [0, 40, 60, 80];
const BUILD_RENT_MULT = [1, 3, 6, 10];

let state = freshState("1");
const rooms = new Map([["1", state]]);
const timers = new Map();

function normalizeRoom(value) {
  const room = String(value || "1").trim().replace(/[^\w가-힣-]/g, "").slice(0, 12);
  return room || "1";
}

function getRoom(value) {
  const code = normalizeRoom(value);
  if (!rooms.has(code) && rooms.size >= 6) throw new Error("방은 최대 6개까지 만들 수 있습니다.");
  if (!rooms.has(code)) rooms.set(code, freshState(code));
  return rooms.get(code);
}

function freshState(roomCode) {
  return {
    roomCode,
    phase: "lobby",
    players: [],
    current: 0,
    secondsLeft: 20 * 60,
    dice: [1, 1],
    doubleStreak: 0,
    rolled: false,
    properties: {},
    buildings: {},
    buyRights: {},
    welfareFund: 0,
    loanRequest: null,
    pendingCard: null,
    lastResult: null,
    tollEvent: null,
    logs: [`${roomCode}번 방입니다. 모둠원은 같은 방 코드로 참가하세요.`],
    finishedReason: ""
  };
}

function publicState() {
  return {
    ...state,
    boardSpaces,
    era: isSecondHalf() ? "후반전" : "전반전",
    players: state.players.map(p => ({...p, netWorth: netWorth(p)})),
    ranking: [...state.players].map(p => ({...p, netWorth: netWorth(p)})).sort((a, b) => b.netWorth - a.netWorth),
    rooms: Array.from(rooms.values()).map(room => ({
      roomCode: room.roomCode,
      phase: room.phase,
      players: room.players.length
    })),
    serverTime: Date.now()
  };
}

function isBuyable(space) {
  return ["country", "continent", "ocean"].includes(space.type);
}

function isBuildable(space) {
  return space.type === "country";
}

function propertyCost(space) {
  if (space.type === "country") return 40;
  if (space.type === "continent") return 60;
  if (space.type === "ocean") return 80;
  return 0;
}

function baseRent(space) {
  if (space.type === "country") return 15;
  if (space.type === "continent") return 25;
  if (space.type === "ocean") return 35;
  return 0;
}

function buildingLevel(index) {
  return state.buildings[index] || 0;
}

function nextBuildCost(index) {
  const lvl = buildingLevel(index);
  return lvl >= 3 ? null : BUILD_COST[lvl + 1];
}

function propertyRent(space, index) {
  const lvl = isBuildable(space) ? buildingLevel(index) : 0;
  return baseRent(space) * BUILD_RENT_MULT[lvl];
}

function isSecondHalf() {
  const buyableTotal = boardSpaces.filter(isBuyable).length;
  const owned = Object.keys(state.properties).length;
  return buyableTotal > 0 && owned / buyableTotal >= 0.7;
}

function ownedIndexes(playerId) {
  return Object.entries(state.properties).filter(([, pid]) => pid === playerId).map(([idx]) => Number(idx));
}

function assetValue(index) {
  const space = {...boardSpaces[index], index};
  let value = propertyCost(space);
  const lvl = buildingLevel(index);
  for (let l = 1; l <= lvl; l++) value += BUILD_COST[l];
  return value;
}

function liquidationValue(index) {
  return Math.ceil(assetValue(index) * 0.7);
}

function netWorth(p) {
  return p.score + ownedIndexes(p.id).reduce((sum, idx) => sum + assetValue(idx), 0);
}

function transferOrClearProperty(index, toId) {
  if (toId) state.properties[index] = toId;
  else { delete state.properties[index]; delete state.buildings[index]; }
}

function chargeOrLiquidate(payer, amount, creditorId) {
  if (payer.score >= amount) {
    payer.score -= amount;
    if (creditorId) { const c = playerById(creditorId); if (c) c.score += amount; }
    return;
  }
  if (creditorId) { const c = playerById(creditorId); if (c) c.score += payer.score; }
  let remaining = amount - payer.score;
  payer.score = 0;
  const owned = ownedIndexes(payer.id);
  for (const idx of owned) {
    if (remaining <= 0) break;
    const value = liquidationValue(idx);
    const spaceName = boardSpaces[idx].name;
    transferOrClearProperty(idx, creditorId);
    remaining -= value;
    const creditor = creditorId ? playerById(creditorId) : null;
    log(`${payer.name}의 ${spaceName}이 ${creditor ? creditor.name : "은행"}에게 넘어갔습니다.`);
  }
  if (remaining > 0 && !payer.bankrupt) {
    payer.bankrupt = true;
    log(`${payer.name}이 파산했습니다.`);
    checkGameOver();
  }
}

function checkGameOver() {
  const active = state.players.filter(pl => !pl.bankrupt);
  if (active.length === 1 && state.players.length > 1) {
    finish(`${active[0].name}님을 제외한 모든 플레이어가 파산하여 ${active[0].name}님이 승리했습니다.`);
  }
}

function log(text) {
  state.logs.unshift(text);
  state.logs = state.logs.slice(0, 80);
}

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function playerById(id) {
  return state.players.find(p => p.id === id);
}

function currentPlayer() {
  return state.players[state.current];
}

function advanceTurn() {
  const total = state.players.length;
  for (let i = 1; i <= total; i++) {
    const idx = (state.current + i) % total;
    if (!state.players[idx].bankrupt) { state.current = idx; return; }
  }
}

function startTimer() {
  clearInterval(timers.get(state.roomCode));
  const room = state;
  const timer = setInterval(() => {
    state = room;
    if (state.phase !== "playing") return;
    state.secondsLeft -= 1;
    if (state.secondsLeft <= 0) finish("20분이 지났습니다. 현금과 자산을 합친 재산이 가장 많은 사람이 승리합니다.");
  }, 1000);
  timers.set(room.roomCode, timer);
}

function finish(reason) {
  state.phase = "finished";
  state.finishedReason = reason;
  state.pendingCard = null;
  clearInterval(timers.get(state.roomCode));
  timers.delete(state.roomCode);
  log(reason);
}

function movePlayer(p, steps) {
  const old = p.pos;
  const next = (p.pos + steps + boardSpaces.length) % boardSpaces.length;
  if (steps > 0 && old + steps >= boardSpaces.length) {
    p.score += 20;
    log(`${p.name}이 출발을 지나 월급 20을 받았습니다.`);
  }
  p.pos = next;
}

function createQuiz(space, playerId) {
  const card = cards[Math.floor(Math.random() * cards.length)];
  const order = card.a.map((text, i) => ({text, correct: i === card.c}));
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  state.pendingCard = {
    id: randomId(),
    type: "quiz",
    playerId,
    space,
    question: card.q,
    choices: order.map(o => o.text),
    correct: order.findIndex(o => o.correct),
    explain: card.e,
    answered: false,
    chosen: null
  };
}

function applyChance(playerId) {
  const p = playerById(playerId);
  const card = chanceCards[Math.floor(Math.random() * chanceCards.length)];
  state.pendingCard = {
    id: randomId(),
    type: "chance",
    playerId,
    title: card.title,
    text: card.text,
    answered: true
  };
  if (card.score) p.score += card.score;
  if (card.penalty === "slow") p.slow = true;
  if (card.stampScore && p.stamps.length) p.score += card.stampScore;
  if (card.move) movePlayer(p, card.move);
  if (card.goStart) {
    p.pos = 0;
    p.score += 1;
  }
  if (card.islandEscape) p.hasIslandEscape = true;
  log(`${p.name}: ${card.title}`);
}

function landOn(p, space) {
  if (space.type === "island") {
    if (p.hasIslandEscape) {
      p.hasIslandEscape = false;
      log(`${p.name}이 무인도 탈출권을 사용해 바로 빠져나왔습니다.`);
    } else {
      p.island = 3;
      log(`${p.name}이 무인도에 갇혔습니다.`);
    }
    return;
  }
  if (space.type === "space") {
    p.spaceTravel = true;
    log(`${p.name}이 우주여행(콜롬비아호) 탑승권을 얻었습니다. 다음 차례에 발사할 수 있어요.`);
    return;
  }
  if (space.type === "fund_pay") {
    const amount = Math.min(15, p.score);
    p.score -= amount;
    state.welfareFund += amount;
    log(`${p.name}이 사회복지기금에 ${amount}을 냈습니다.`);
    return;
  }
  if (space.type === "fund_take") {
    const amount = state.welfareFund;
    p.score += amount;
    state.welfareFund = 0;
    log(`${p.name}이 사회복지기금 ${amount}을 받았습니다.`);
    return;
  }
  const ownerId = state.properties[p.pos];
  if (isBuyable(space) && ownerId && ownerId !== p.id) {
    const owner = playerById(ownerId);
    const collectible = space.type === "country" || isSecondHalf();
    if (collectible) {
      const rent = propertyRent(space, p.pos);
      chargeOrLiquidate(p, rent, ownerId);
      log(`${p.name}이 ${space.name} 통행료 ${rent}을 ${owner ? owner.name : "소유자"}에게 냈습니다.`);
      state.tollEvent = {
        id: randomId(),
        payerId: p.id, payerName: p.name,
        ownerId: ownerId, ownerName: owner ? owner.name : "소유자",
        amount: rent, spaceName: space.name
      };
    } else {
      log(`${space.name}은 특수 대지라 전반전에는 통행료를 받을 수 없습니다.`);
    }
  }
  if (["quiz", "country", "continent", "ocean"].includes(space.type)) createQuiz(space, p.id);
  if (space.type === "chance") applyChance(p.id);
}

function endTurn(playerId) {
  const p = currentPlayer();
  if (!p || p.id !== playerId || state.pendingCard && !state.pendingCard.answered) return false;
  if (p.loanAmount > 0) {
    p.loanTurnsLeft -= 1;
    if (p.loanTurnsLeft <= 0) {
      const amount = p.loanAmount;
      p.loanAmount = 0;
      p.loanTurnsLeft = 0;
      chargeOrLiquidate(p, amount, null);
      log(`${p.name}이 은행 대출금 ${amount}을 상환했습니다.`);
    }
  }
  if (p.spaceTravel) p.spaceTravel = false;
  delete state.buyRights[p.id];
  state.doubleStreak = 0;
  advanceTurn();
  state.rolled = false;
  state.pendingCard = null;
  state.lastResult = null;
  return true;
}

function handleAction(body) {
  const {action, playerId, name, choice, index, amount, targetIndex} = body || {};
  if (action === "join") {
    let p = playerById(playerId);
    if (p) {
      p.name = cleanName(name || p.name);
      return {playerId: p.id};
    }
    if (state.phase !== "lobby") throw new Error("게임이 이미 시작되어 새로 참가할 수 없습니다.");
    if (state.players.length >= 6) throw new Error("최대 6명까지 참가할 수 있습니다.");
    const id = randomId();
    p = {
      id, name: cleanName(name || `${state.players.length + 1}번`), color: colors[state.players.length],
      pos: 0, score: 20, stamps: [], continents: [], slow: false,
      island: 0, hasIslandEscape: false, spaceTravel: false,
      loanUsed: false, loanAmount: 0, loanTurnsLeft: 0, bankrupt: false
    };
    state.players.push(p);
    log(`${p.name}이 참가했습니다.`);
    return {playerId: id};
  }

  if (action === "reset") {
    clearInterval(timers.get(state.roomCode));
    timers.delete(state.roomCode);
    Object.assign(state, freshState(state.roomCode));
    return {};
  }

  if (action === "start") {
    if (state.phase !== "lobby") return {};
    if (state.players.length < 2) throw new Error("2명 이상 참가해야 시작할 수 있습니다.");
    const startMoney = state.players.length <= 2 ? 586 : 293;
    state.players.forEach(pl => { pl.score = startMoney; });
    state.phase = "playing";
    state.secondsLeft = 20 * 60;
    state.current = 0;
    state.rolled = false;
    log(`게임을 시작했습니다. 1인당 시작 자금 ${startMoney}.`);
    startTimer();
    return {};
  }

  if (action === "finish") {
    finish("게임을 마쳤습니다. 현금과 자산을 합친 재산이 가장 많은 사람이 승리합니다.");
    return {};
  }

  if (state.phase !== "playing") throw new Error("지금은 게임 중이 아닙니다.");

  if (action === "approveLoan") {
    const req = state.loanRequest;
    if (!req) throw new Error("대기 중인 대출 신청이 없습니다.");
    if (req.playerId === playerId) throw new Error("본인은 동의할 수 없습니다.");
    if (!req.approvedBy.includes(playerId)) req.approvedBy.push(playerId);
    const borrower = playerById(req.playerId);
    if (borrower && req.approvedBy.length >= 1) {
      borrower.score += req.amount;
      borrower.loanUsed = true;
      borrower.loanAmount = req.amount;
      borrower.loanTurnsLeft = 3;
      log(`${borrower.name}의 대출 ${req.amount}이 승인되어 지급되었습니다. 3턴 안에 상환해야 합니다.`);
      state.loanRequest = null;
    }
    return {};
  }

  const p = currentPlayer();
  if (!p || p.id !== playerId) throw new Error("현재 차례인 학생만 조작할 수 있습니다.");

  if (action === "roll") {
    if (state.rolled || (state.pendingCard && !state.pendingCard.answered)) throw new Error("이미 주사위를 굴렸습니다.");

    if (p.island > 0) {
      const d1 = 1 + Math.floor(Math.random() * 6), d2 = 1 + Math.floor(Math.random() * 6);
      state.dice = [d1, d2];
      state.rolled = true;
      if (d1 === d2) {
        p.island = 0;
        log(`${p.name}이 더블이 나와 무인도에서 탈출했습니다!`);
      } else {
        p.island -= 1;
        log(p.island > 0 ? `${p.name}이 무인도 탈출에 실패했습니다. (남은 턴 ${p.island})` : `${p.name}이 무인도에서 풀려났습니다.`);
      }
      return {};
    }

    delete state.buyRights[p.id];
    const d1 = 1 + Math.floor(Math.random() * 6), d2 = 1 + Math.floor(Math.random() * 6);
    let sum = d1 + d2;
    if (p.slow) {
      sum = Math.max(1, sum - 1);
      p.slow = false;
    }
    state.dice = [d1, d2];
    const isDouble = d1 === d2;
    state.doubleStreak = isDouble ? state.doubleStreak + 1 : 0;
    state.rolled = !(isDouble && state.doubleStreak < 3);
    movePlayer(p, sum);
    const space = {...boardSpaces[p.pos], index: p.pos};
    log(`${p.name}이 ${sum}칸(${d1},${d2}) 이동해 ${space.name}에 도착했습니다.`);
    landOn(p, space);
    if (isDouble && state.doubleStreak < 3) log(`${p.name}이 더블이 나와 한 번 더 굴릴 수 있어요!`);
    else if (isDouble) log(`${p.name}이 더블을 3번 연속 굴려 이번 턴은 여기서 마무리합니다.`);
    return {};
  }

  if (action === "escapeIsland") {
    if (p.island <= 0) throw new Error("무인도에 갇혀 있지 않습니다.");
    chargeOrLiquidate(p, 20, null);
    p.island = 0;
    log(`${p.name}이 20을 내고 무인도에서 탈출했습니다.`);
    return {};
  }

  if (action === "launch") {
    if (!p.spaceTravel) throw new Error("우주여행권이 없습니다.");
    if (state.rolled || (state.pendingCard && !state.pendingCard.answered)) throw new Error("이미 이번 턴 행동을 했습니다.");
    const dest = Number.isInteger(targetIndex) ? targetIndex : -1;
    if (dest < 0 || dest >= boardSpaces.length) throw new Error("이동할 칸을 선택하세요.");
    chargeOrLiquidate(p, 20, null);
    p.spaceTravel = false;
    state.rolled = true;
    movePlayer(p, dest - p.pos);
    const space = {...boardSpaces[p.pos], index: p.pos};
    log(`${p.name}이 콜롬비아호를 타고 ${space.name}으로 이동했습니다.`);
    landOn(p, space);
    return {};
  }

  if (action === "buy") {
    if (!state.rolled || state.pendingCard && !state.pendingCard.answered) throw new Error("카드를 먼저 해결해야 살 수 있습니다.");
    const space = {...boardSpaces[p.pos], index: p.pos};
    if (!isBuyable(space)) throw new Error("이 칸은 살 수 없습니다.");
    if (state.buyRights[p.id] !== p.pos) throw new Error("문제를 맞힌 칸만 살 수 있습니다.");
    if (state.properties[p.pos]) throw new Error("이미 누군가 산 칸입니다.");
    const cost = propertyCost(space);
    if (p.score < cost) throw new Error(`${cost}가 필요합니다.`);
    p.score -= cost;
    state.properties[p.pos] = p.id;
    delete state.buyRights[p.id];
    log(`${p.name}이 ${space.name}을 ${cost}에 샀습니다.`);
    return {};
  }

  if (action === "sell") {
    const targetIdx = Number.isInteger(index) ? index : p.pos;
    if (targetIdx < 0 || targetIdx >= boardSpaces.length) throw new Error("잘못된 칸입니다.");
    const space = {...boardSpaces[targetIdx], index: targetIdx};
    if (!isBuyable(space) || state.properties[targetIdx] !== p.id) throw new Error("소유한 땅이 아닙니다.");
    const refund = liquidationValue(targetIdx);
    transferOrClearProperty(targetIdx, null);
    p.score += refund;
    log(`${p.name}이 ${space.name}을 팔아 ${refund}을 받았습니다.`);
    return {};
  }

  if (action === "build") {
    if (state.rolled) throw new Error("주사위를 굴리기 전에만 건물을 지을 수 있습니다.");
    const targetIdx = Number.isInteger(index) ? index : -1;
    if (targetIdx < 0 || targetIdx >= boardSpaces.length) throw new Error("잘못된 칸입니다.");
    const space = {...boardSpaces[targetIdx], index: targetIdx};
    if (!isBuildable(space) || state.properties[targetIdx] !== p.id) throw new Error("건물을 지을 수 있는 내 땅이 아닙니다.");
    const cost = nextBuildCost(targetIdx);
    if (cost === null) throw new Error("이미 호텔까지 지었습니다.");
    if (p.score < cost) throw new Error(`${cost}가 필요합니다.`);
    p.score -= cost;
    state.buildings[targetIdx] = buildingLevel(targetIdx) + 1;
    const levelName = ["대지", "별장", "빌딩", "호텔"][state.buildings[targetIdx]];
    log(`${p.name}이 ${space.name}에 ${levelName}을 지었습니다.`);
    return {};
  }

  if (action === "requestLoan") {
    if (p.loanUsed) throw new Error("대출은 게임 중 한 번만 받을 수 있습니다.");
    const amt = Math.min(100, Math.max(1, Number(amount) || 0));
    state.loanRequest = {id: randomId(), playerId: p.id, playerName: p.name, amount: amt, approvedBy: []};
    log(`${p.name}이 은행 대출 ${amt}을 신청했습니다. 다른 학생의 동의가 필요해요.`);
    return {};
  }

  if (action === "answer") {
    const card = state.pendingCard;
    if (!card || card.type !== "quiz" || card.playerId !== p.id || card.answered) throw new Error("풀 수 있는 카드가 없습니다.");
    card.answered = true;
    card.chosen = Number(choice);
    const space = card.space;
    if (card.chosen === card.correct) {
      p.score += 2;
      if (isBuyable(space) && !state.properties[space.index]) {
        state.buyRights[p.id] = space.index;
      }
      if (space.type === "country" && !p.stamps.includes(space.name)) {
        p.stamps.push(space.name);
        p.continents.push(space.continent);
        p.score += 1;
        log(`${p.name}이 ${space.name} 도장을 받았습니다.`);
      }
      if ((space.type === "continent" || space.type === "ocean") && !p.stamps.includes(space.name)) p.stamps.push(space.name);
      state.lastResult = `${p.name} 정답! 2를 얻었습니다.`;
      log(state.lastResult);
    } else {
      delete state.buyRights[p.id];
      p.score = Math.max(0, p.score - 1);
      state.lastResult = `${p.name} 아쉽습니다. 1을 사용했습니다.`;
      log(state.lastResult);
    }
    return {};
  }

  if (action === "next") {
    endTurn(playerId);
    return {};
  }

  throw new Error("알 수 없는 요청입니다.");
}

function cleanName(value) {
  return String(value || "").trim().slice(0, 8) || "학생";
}

function sendJson(res, code, data) {
  res.writeHead(code, {"Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store"});
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 10000) req.destroy();
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (err) { reject(err); }
    });
  });
}

function mime(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".svg")) return "image/svg+xml";
  if (file.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/api/state") {
      state = getRoom(url.searchParams.get("room"));
      return sendJson(res, 200, publicState());
    }
    if (req.method === "POST" && url.pathname === "/api/action") {
      const body = await readBody(req);
      state = getRoom(body.room);
      const result = handleAction(body);
      return sendJson(res, 200, {ok:true, ...result, state: publicState()});
    }
    let file = url.pathname === "/" ? "world_blue_marble_lan.html" : decodeURIComponent(url.pathname.slice(1));
    file = path.normalize(file).replace(/^(\.\.[/\\])+/, "");
    const fullPath = path.join(ROOT, file);
    if (!fullPath.startsWith(ROOT) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      res.writeHead(404, {"Content-Type":"text/plain; charset=utf-8"});
      return res.end("파일을 찾을 수 없습니다.");
    }
    res.writeHead(200, {"Content-Type": mime(fullPath), "Cache-Control":"no-store"});
    fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    sendJson(res, 400, {ok:false, error: err.message || "요청을 처리하지 못했습니다."});
  }
});

function localAddresses() {
  const found = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const item of list || []) {
      if (item.family === "IPv4" && !item.internal) found.push(item.address);
    }
  }
  return found;
}

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("World Blue Marble server started.");
  console.log("Local/LAN use: open one of the addresses below.");
  console.log("Online hosting use: open the public HTTPS address from your host.");
  console.log("");
  for (const ip of localAddresses()) console.log(`LAN address: http://${ip}:${PORT}`);
  console.log(`This PC: http://127.0.0.1:${PORT}`);
  console.log("");
  console.log("Press Ctrl+C to stop.");
});
