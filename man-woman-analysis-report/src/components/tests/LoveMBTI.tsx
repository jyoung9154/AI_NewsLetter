'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Sparkles, Heart, Share2, Download, MessageCircle, RefreshCw, ChevronRight, Zap, Target, Shield, Flame, Anchor } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Option {
    text: string;
    type: string;
}

interface Question {
    id: number;
    dimension: string;
    question: string;
    options: Option[];
}

const questions: Question[] = [
    { "id": 1, "dimension": "EI", "question": "데이트 후 집에 돌아가는 길, 당신의 기분은?", "options": [{ "text": "상대방과 함께하며 충전된 기운에 흥이 난다.", "type": "E" }, { "text": "즐거웠지만 이제 빨리 가서 혼자 쉬고 싶다.", "type": "I" }] },
    { "id": 2, "dimension": "EI", "question": "연인과 싸운 직후, 당신의 행동은?", "options": [{ "text": "바로 전화를 하거나 만나서 대화로 풀고 싶다.", "type": "E" }, { "text": "잠시 혼자만의 시간을 가지며 생각을 정리해야 한다.", "type": "I" }] },
    { "id": 3, "dimension": "EI", "question": "주말 데이트 장소를 정할 때 선호하는 곳은?", "options": [{ "text": "사람들이 많고 에너지가 넘치는 핫플레이스", "type": "E" }, { "text": "우리끼리 조용히 대화에 집중할 수 있는 아늑한 곳", "type": "I" }] },
    { "id": 4, "dimension": "EI", "question": "연인과 친구들의 모임이 겹쳤을 때 당신은?", "options": [{ "text": "연인을 친구 모임에 데려가서 다 같이 즐긴다.", "type": "E" }, { "text": "둘만의 시간을 위해 친구 모임은 다음에 간다.", "type": "I" }] },
    { "id": 5, "dimension": "EI", "question": "비어있는 평일 저녁, 연인이 만나자고 한다면?", "options": [{ "text": "당연히 OK! 피곤해도 만나서 활력을 얻고 싶다.", "type": "E" }, { "text": "이미 혼자 쉬기로 마음먹었다면 만나기 부담스럽다.", "type": "I" }] },
    { "id": 6, "dimension": "EI", "question": "연애 중 당신의 연락 스타일은?", "options": [{ "text": "틈날 때마다 전화나 메신저로 소소한 일상을 공유한다.", "type": "E" }, { "text": "용건 위주로 연락하거나 혼자만의 시간에는 휴대폰을 멀리한다.", "type": "I" }] },
    { "id": 7, "dimension": "EI", "question": "좋아하는 이성 앞에서 당신의 모습은?", "options": [{ "text": "말이 많아지고 내 매력을 적극적으로 어필한다.", "type": "E" }, { "text": "조용히 지켜보며 상대가 다가오기를 기다린다.", "type": "I" }] },
    { "id": 8, "dimension": "EI", "question": "꿈꾸는 프로포즈의 방식은?", "options": [{ "text": "주변 지인들이나 많은 사람의 축복을 받는 화려한 파티", "type": "E" }, { "text": "오직 둘만이 있는 공간에서 진심을 담은 고요한 고백", "type": "I" }] },
    { "id": 9, "dimension": "EI", "question": "새로운 취미를 배울 때 연인과 함께라면?", "options": [{ "text": "다른 사람들과 어울려 배우는 동호회나 클래스", "type": "E" }, { "text": "강사와 우리 둘만 있거나 개인적으로 배우는 수업", "type": "I" }] },
    { "id": 10, "dimension": "EI", "question": "연인과 하루 종일 통화했을 때 당신은?", "options": [{ "text": "더 친밀해진 것 같아 기운이 펄펄 난다.", "type": "E" }, { "text": "사랑하지만 이제는 대화를 멈추고 쉬고 싶다.", "type": "I" }] },
    { "id": 11, "dimension": "SN", "question": "연인이 '나 오늘 너무 피곤해'라고 했을 때 떠오르는 생각은?", "options": [{ "text": "오늘 무슨 일이 있었는지, 잠은 몇 시간 잤는지 궁금하다.", "type": "S" }, { "text": "많이 힘들었겠구나 하며 그 기분을 짐작해본다.", "type": "N" }] },
    { "id": 12, "dimension": "SN", "question": "우리의 10년 후 모습에 대해 이야기할 때 당신은?", "options": [{ "text": "연봉, 자녀 계획, 거주 지역 등 구체적인 계획을 세운다.", "type": "S" }, { "text": "그때도 여전히 서로를 바라보며 웃을 수 있을지 이상을 그린다.", "type": "N" }] },
    { "id": 13, "dimension": "SN", "question": "연인에게 줄 선물로 더 가치 있다고 느끼는 것은?", "options": [{ "text": "상대방에게 지금 딱 필요한 실용적인 물건", "type": "S" }, { "text": "나의 정성과 의미가 담긴 특별하고 상징적인 선물", "type": "N" }] },
    { "id": 14, "dimension": "SN", "question": "드라마나 영화를 볼 때 당신의 반응은?", "options": [{ "text": "스토리의 개연성이나 현실적인 소재에 집중한다.", "type": "S" }, { "text": "주인공의 감정에 이입하거나 숨겨진 은유를 해석한다.", "type": "N" }] },
    { "id": 15, "dimension": "SN", "question": "연인과 길을 걷다 발견한 멋진 풍경을 볼 때?", "options": [{ "text": "와~ 나무가 정말 크다! 하늘색이 진짜 파란색이네!", "type": "S" }, { "text": "마치 동화 속에 들어온 것 같은 묘한 기분이야.", "type": "N" }] },
    { "id": 16, "dimension": "SN", "question": "싸울 때 당신이 주로 언급하는 내용은?", "options": [{ "text": "방금 네가 했던 구체적인 말과 행동의 팩트", "type": "S" }, { "text": "말 뒤에 숨겨진 너의 의도와 관계의 본질적인 문제", "type": "N" }] },
    { "id": 17, "dimension": "SN", "question": "새로운 데이트 코스를 짤 때 당신은?", "options": [{ "text": "블로그 리뷰나 메뉴판 사진을 꼼꼼히 보고 결정한다.", "type": "S" }, { "text": "이름이 마음에 들거나 느낌이 좋은 곳을 우선순위에 둔다.", "type": "N" }] },
    { "id": 18, "dimension": "SN", "question": "연인이 뜬금없이 '만약에 우리가...' 하며 상상을 한다면?", "options": [{ "text": "일어나지도 않을 일을 왜 생각하는지 이해가 안 된다.", "type": "S" }, { "text": "나도 같이 몰입해서 더 엉뚱한 상상을 보탠다.", "type": "N" }] },
    { "id": 19, "dimension": "SN", "question": "연애 초기 당신이 주로 하는 질문은?", "options": [{ "text": "무슨 음식 좋아해? 쉬는 날엔 보통 뭐 해?", "type": "S" }, { "text": "넌 사랑이 뭐라고 생각해? 인생에서 가장 중요하게 여기는 건 뭐야?", "type": "N" }] },
    { "id": 20, "dimension": "SN", "question": "여행 기념품을 살 때 당신의 기준은?", "options": [{ "text": "집에서 실제로 장식하거나 사용할 만한 가치가 있는 것", "type": "S" }, { "text": "이곳에서의 추억을 가장 잘 떠올리게 해줄 만한 것", "type": "N" }] },
    { "id": 21, "dimension": "TF", "question": "연인이 실수를 해서 속상해할 때 당신의 첫마디는?", "options": [{ "text": "어쩌다가 그렇게 된 거야? 다음엔 이렇게 해봐.", "type": "T" }, { "text": "정말 속상했겠다... 내가 다 화나네. 괜찮아?", "type": "F" }] },
    { "id": 22, "dimension": "TF", "question": "기념일 이벤트를 준비할 때 더 중요하게 생각하는 것은?", "options": [{ "text": "상대방이 만족할 만한 퀄리티와 효율적인 코스", "type": "T" }, { "text": "나의 정성과 진심이 얼마나 전달될지 고민하는 마음", "type": "F" }] },
    { "id": 23, "dimension": "TF", "question": "연인과 가치관 차이로 논쟁할 때 당신의 태도는?", "options": [{ "text": "누구의 논리가 더 타당한지 끝까지 가려내고 싶다.", "type": "T" }, { "text": "맞고 틀림보다는 서로의 감정이 상하지 않는 것이 우선이다.", "type": "F" }] },
    { "id": 24, "dimension": "TF", "question": "연인에게 듣고 싶은 최고의 칭찬은?", "options": [{ "text": "넌 정말 똑똑하고 배울 점이 많은 든든한 사람이야.", "type": "T" }, { "text": "넌 나를 가장 행복하게 해주는 따뜻한 사람이야.", "type": "F" }] },
    { "id": 25, "dimension": "TF", "question": "헤어질 결심을 할 때 당신의 마음 상태는?", "options": [{ "text": "이 관계가 미래에 도움이 안 될 것을 이성적으로 판단한다.", "type": "T" }, { "text": "더 이상 사랑이 느껴지지 않거나 상처받은 마음이 한계에 달한다.", "type": "F" }] },
    { "id": 26, "dimension": "TF", "question": "연인이 갑자기 울음을 터뜨린다면?", "options": [{ "text": "일단 당황해서 왜 우는지 이유를 물어본다.", "type": "T" }, { "text": "말없이 안아주거나 같이 눈물을 흘리며 공감한다.", "type": "F" }] },
    { "id": 27, "dimension": "TF", "question": "친구가 내 연인을 험담한다면 당신은?", "options": [{ "text": "친구가 왜 그런 생각을 했는지 논리적인 근거를 들어 반박한다.", "type": "T" }, { "text": "내 사람을 무시하는 친구에게 기분이 몹시 나쁘다.", "type": "F" }] },
    { "id": 28, "dimension": "TF", "question": "연인에게 서운함을 느낄 때 더 화가 나는 지점은?", "options": [{ "text": "상대방의 행동이 예의에 어긋나거나 상식적이지 않을 때", "type": "T" }, { "text": "내 마음을 알아주려 하지 않고 차갑게 대할 때", "type": "F" }] },
    { "id": 29, "dimension": "TF", "question": "연애 상담을 해줄 때 당신의 스타일은?", "options": [{ "text": "문제점을 날카롭게 지적하고 현실적인 팩폭을 날린다.", "type": "T" }, { "text": "전적으로 내 친구 편을 들어주며 감정적으로 지지해준다.", "type": "F" }] },
    { "id": 30, "dimension": "TF", "question": "사랑의 정의를 내린다면?", "options": [{ "text": "서로의 성장을 돕고 책임을 다하는 지적 결합", "type": "T" }, { "text": "조건 없이 헌신하고 마음을 다하는 정서적 교감", "type": "F" }] },
    { "id": 31, "dimension": "JP", "question": "주말 데이트 전날, 당신의 모습은?", "options": [{ "text": "방문할 가게의 예약과 동선을 미리 완벽히 짜둔다.", "type": "J" }, { "text": "내일 가서 기분 내키는 대로 움직이기로 한다.", "type": "P" }] },
    { "id": 32, "dimension": "JP", "question": "연인과 다음 여행을 약속할 때?", "options": [{ "text": "비행기표와 숙소부터 바로 결제하고 일정을 잡는다.", "type": "J" }, { "text": "언젠가 가고 싶다는 로망을 이야기하며 천천히 생각한다.", "type": "P" }] },
    { "id": 33, "dimension": "JP", "question": "데이트 약속 시간에 연인이 10분 늦는다면?", "options": [{ "text": "약속 시간을 가볍게 여기는 것 같아 은근히 스트레스받는다.", "type": "J" }, { "text": "그럴 수도 있지! 나도 천천히 준비하면서 기다린다.", "type": "P" }] },
    { "id": 34, "dimension": "JP", "question": "준비한 식당이 문을 닫았을 때 당신의 반응은?", "options": [{ "text": "플랜 B를 미리 준비하지 않은 것에 대해 당황스럽다.", "type": "J" }, { "text": "근처에 보이는 다른 맛있어 보이는 곳으로 운명처럼 들어간다.", "type": "P" }] },
    { "id": 35, "dimension": "JP", "question": "연인의 가방이나 책상이 어질러진 것을 봤을 때?", "options": [{ "text": "정리정돈이 안 되어 있으면 내 일처럼 신경 쓰인다.", "type": "J" }, { "text": "자유분방해 보이고 인간미가 느껴져서 상관없다.", "type": "P" }] },
    { "id": 36, "dimension": "JP", "question": "연락이 한동안 없다가 갑자기 온 연인의 번개 제안?", "options": [{ "text": "오늘 일정이 꼬이는 것 같아 반갑지만은 않다.", "type": "J" }, { "text": "서프라이즈는 언제나 환영! 당장 달려 나갈 준비를 한다.", "type": "P" }] },
    { "id": 37, "dimension": "JP", "question": "내일 입을 데이트 옷을 당신은?", "options": [{ "text": "잠들기 전 날씨와 장소를 고려해 미리 골라둔다.", "type": "J" }, { "text": "내일 아침 눈뜬 후 기분과 컨디션에 따라 고른다.", "type": "P" }] },
    { "id": 38, "dimension": "JP", "question": "영화 예매를 할 때 당신의 스타일은?", "options": [{ "text": "원하는 자리를 위해 이틀 전에는 미리 예매한다.", "type": "J" }, { "text": "상영관 앞에서 가장 빠른 시간대의 남는 좌석을 산다.", "type": "P" }] },
    { "id": 39, "dimension": "JP", "question": "연애 중 다툼의 주된 원인이 될 수 있는 점은?", "options": [{ "text": "상대방의 무계획하고 즉흥적인 태도가 답답할 때", "type": "J" }, { "text": "상대방의 지나치게 빡빡하고 통제하려는 성향이 피곤할 때", "type": "P" }] },
    { "id": 40, "dimension": "JP", "question": "휴대폰 알림창의 정리 상태는?", "options": [{ "text": "읽지 않은 수치는 바로바로 지우고 정리해야 직성이 풀린다.", "type": "J" }, { "text": "수백 개의 알림이 쌓여 있어도 크게 신경 쓰지 않는다.", "type": "P" }] }
];

const results: Record<string, any> = {
    "ISTJ": {
        "title": "현실적인 사랑의 수호자",
        "description": "연애에서도 책임감과 신뢰를 가장 중요하게 생각하는 타입입니다.",
        "datingStyle": "당신은 한눈에 불붙는 사랑보다는 천천히 신뢰를 쌓아가는 신중한 연애를 선호합니다. 연인에게 가장 의지가 되는 든든한 나무와 같은 존재이며, 말보다는 행동으로 자신의 마음을 증명합니다. 약속 시간 준수, 계획된 데이트 등 안정적인 환경에서 행복을 느낍니다.",
        "strengths": ["높은 책임감과 성실함", "안정적이고 예측 가능한 관계 유지", "현실적이고 실질적인 도움 제공"],
        "weaknesses": ["감정 표현에 다소 서툶", "변화나 돌발 상황에 대한 스트레스", "보수적인 연애관으로 인한 답답함"],
        "advice": "가끔은 효율성보다는 오직 상대의 감정에만 집중하는 시간을 가져보세요. 감정적인 공감이 때로는 정답보다 더 큰 힘이 됩니다.",
        "partner": "ESFP",
        "partnerTitle": "분위기 메이커 자유 영혼",
        "caution": "ENFP",
        "cautionTitle": "열정적인 몽상가"
    },
    "ISFJ": {
        "title": "아낌없이 주는 사랑꾼",
        "description": "상대방의 행복이 나의 행복이 되는, 세심한 배려의 끝판왕입니다.",
        "datingStyle": "연인의 사소한 습관 하나까지 기억해주는 섬세함을 가졌습니다. 상대방을 위해 무언가를 해줄 때 가장 큰 기쁨을 느끼며, 헌신적인 사랑을 합니다. 갈등을 피하려는 경향이 있어 가끔은 속마음을 숨기기도 하지만, 내 편이 생겼다는 확신이 들면 끝없는 지지를 보냅니다.",
        "strengths": ["뛰어난 기억력과 세심한 케어", "가정적이고 헌신적인 태도", "부드럽고 온화한 소통 방식"],
        "weaknesses": ["본인의 서운함을 잘 표현하지 못함", "거절을 어려워함", "변화에 대한 두려움"],
        "advice": "당신의 헌신이 당연하게 여겨지지 않도록, 당신의 감정과 솔직한 의견도 당당하게 말해보세요. 당신도 충분히 사랑받을 자격이 있습니다.",
        "partner": "ESTP",
        "partnerTitle": "수완 좋은 활동가",
        "caution": "ENTP",
        "cautionTitle": "뜨거운 논쟁을 즐기는 변론가"
    },
    "INFJ": {
        "title": "영혼의 단짝을 찾는 소통가",
        "description": "겉은 차분해 보이지만 속은 누구보다 뜨거운 로맨티스트입니다.",
        "datingStyle": "당신에게 연애는 단순한 만남 이상으로, 정신적으로 깊이 연결된 '영혼의 파트너'를 찾는 과정입니다. 상대방의 가치관과 내면을 중시하며, 깊이 있는 대화가 통할 때 가장 큰 매력을 느낍니다. 자신만의 기준이 확고하여 연애를 시작하기까지 오랜 시간이 걸리기도 합니다.",
        "strengths": ["깊은 공감 능력과 통찰력", "일대일 관계에서의 완전한 몰입", "상대방의 잠재력을 이끌어내는 지지"],
        "weaknesses": ["높은 기대치로 인한 실망", "속마음을 알기 어려운 신비주의", "갈등 상황에서 극도로 예민해짐"],
        "advice": "상대가 당신의 높은 기준에 미치지 못하더라도, 그 사람 자체의 부족함을 있는 그대로 받아들여 보세요. 완벽하지 않아도 사랑은 충분히 가치 있습니다.",
        "partner": "ENFP",
        "partnerTitle": "재기발랄한 활동가",
        "caution": "ESTP",
        "cautionTitle": "수완 좋은 활동가"
    },
    "INTJ": {
        "title": "지적인 성장을 함께할 설계자",
        "description": "사랑도 분석하고 계획하는, 이성적인 로맨티스트입니다.",
        "datingStyle": "당신은 사랑에서도 지적인 자극과 배울 점을 중요하게 생각합니다. 단순히 즐거운 데이트보다는 함께 미래를 설계하고 성장할 수 있는 파트너를 원합니다. 감정 과잉이나 드라마틱한 감정싸움을 매우 소모적으로 느끼며, 효율적이고 명확한 소통을 선호합니다.",
        "strengths": ["독립적이고 주체적인 태도", "장기적인 관계에 대한 비전", "논리적이고 명확한 갈등 해결"],
        "weaknesses": ["차갑거나 무심해 보일 수 있음", "감정적인 공감이 다소 부족함", "자신의 방식을 고수하려는 고집"],
        "advice": "사랑은 논리로만 설명되지 않는 감정의 영역입니다. 가끔은 머리보다는 가슴이 시키는 대로, 논리적 근거 없이 '그냥 좋다'고 표현해보세요.",
        "partner": "ENTP",
        "partnerTitle": "뜨거운 논쟁을 즐기는 변론가",
        "caution": "ESFJ",
        "cautionTitle": "사교적인 외교관"
    },
    "ISTP": {
        "title": "쿨하고 담백한 자유로운 연인",
        "description": "구속 없는 자유와 즐거운 경험이 중요한 '현재 중심적' 타입입니다.",
        "datingStyle": "말보다는 행동으로 사랑을 보여주는 타입입니다. 감정 표현이 다소 무뚝뚝할 수 있지만, 연인이 필요할 때 가장 실질적인 도움을 주는 사람이기도 합니다. 각자의 개인 시간과 공간을 매우 중요하게 생각하며, 너무 잦은 연락이나 감정적인 요구에 답답함을 느낍니다.",
        "strengths": ["적응력이 좋고 유연함", "부담스럽지 않은 쿨한 연애", "위기 상황에서의 냉철한 해결"],
        "weaknesses": ["회피적인 태도(갈등 시 잠수)", "무심해 보일 수 있는 반응", "미래에 대한 진지한 고민 부재"],
        "advice": "당신의 자유를 존중받고 싶은 만큼, 상대방의 감정적인 안정감도 중요합니다. 가끔은 '나 지금 혼자 있고 싶어'라고 명확히 소통하며 오해를 방지하세요.",
        "partner": "ESFJ",
        "partnerTitle": "사교적인 외교관",
        "caution": "ENFJ",
        "cautionTitle": "정의로운 사회운동가"
    },
    "ISFP": {
        "title": "감수성 풍부한 평화주의자",
        "description": "따뜻한 감성과 배려로 연인을 감싸는 로맨티시스트입니다.",
        "datingStyle": "당신은 연애에서 '지금 이 순간'의 행복과 조화를 무엇보다 중시합니다. 예술적 감각이 뛰어나 데이트 코스나 선물을 고를 때 센스가 돋보입니다. 비판에 민감하고 갈등을 싫어하여 상대방에게 잘 맞춰주지만, 혼자서 상처를 쌓아두다가 한꺼번에 터뜨리기도 합니다.",
        "strengths": ["다정다감하고 포용력이 넓음", "예술적 감성과 센스", "상대방의 가치를 존중함"],
        "weaknesses": ["결단력 부족", "갈등을 회피하려는 성향", "미래에 대한 구체적 계획 부재"],
        "advice": "상대방에게 맞추는 것만이 최선은 아닙니다. 당신이 진정으로 원하는 것이 무엇인지 솔직하게 말할 때, 관계는 더 건강하고 단단해집니다.",
        "partner": "ESTJ",
        "partnerTitle": "엄격한 관리자",
        "caution": "ENTJ",
        "cautionTitle": "대담한 전략가"
    },
    "INFP": {
        "title": "순수하고 이상적인 몽상가",
        "description": "사랑에 대한 깊은 가치와 의미를 부여하는 헌신적인 타입입니다.",
        "datingStyle": "당신은 세상 어딘가에 있을 '운명적인 사랑'을 믿으며, 연인에게 자신의 모든 것을 보여주고 싶어 합니다. 풍부한 상상력과 감수성으로 연애를 한 편의 소설처럼 아름답게 가꾸려 노력합니다. 하지만 현실적인 문제에 직면할 때 상상 속의 연애와 괴리를 느끼며 힘들어하기도 합니다.",
        "strengths": ["무한한 지지와 따뜻함", "매우 깊고 진실한 공감력", "창의적이고 특별한 사랑 표현"],
        "weaknesses": ["현실적이지 못한 이상 추구", "지나치게 감정에 휩쓸림", "비판을 개인적인 공격으로 받아들임"],
        "advice": "사랑하는 마음뿐만 아니라, 현실의 문제들을 함께 해결해 나가는 과정도 사랑의 일부임을 기억하세요. 갈등은 관계의 끝이 아니라 깊어지는 과정입니다.",
        "partner": "ENFJ",
        "partnerTitle": "정의로운 사회운동가",
        "caution": "ESTJ",
        "cautionTitle": "엄격한 관리자"
    },
    "INTP": {
        "title": "사랑도 탐구하는 지적인 모험가",
        "description": "호기심 많고 독특한 시선으로 상대를 탐구하는 스타일입니다.",
        "datingStyle": "당신에게 연애는 또 하나의 흥미로운 탐험 주제입니다. 상대방의 사고방식과 지식에 매력을 느끼며, 뻔한 데이트보다는 독특하고 의미 있는 경험을 선호합니다. 감정 표현에는 다소 인색해 보일 수 있지만, 당신만의 논리적인 방식으로 상대방을 아끼고 존중하고 있습니다.",
        "strengths": ["편견 없는 개방된 사고", "독창적이고 유머러스함", "독립적이고 뒤끝 없는 성격"],
        "weaknesses": ["공감보다는 분석이 앞섬", "지적 거만함으로 오해받을 수 있음", "연락이나 약속에 다소 소홀함"],
        "advice": "때로는 분석보다는 공감이 연인에게 더 큰 위로가 됩니다. '왜 그런지' 이해하려 하기보다 그냥 '그랬구나' 하고 마음으로 먼저 안아주세요.",
        "partner": "ENTJ",
        "partnerTitle": "대담한 전략가",
        "caution": "ESFJ",
        "cautionTitle": "사교적인 외교관"
    },
    "ESTP": {
        "title": "활동적이고 정열적인 모험가",
        "description": "지루할 틈 없는 역동적인 데이트를 주도하는 타입입니다.",
        "datingStyle": "당신과의 연애는 항상 새롭고 짜릿합니다. 현재의 즐거움에 매우 솔직하며, 자신의 매력을 적극적으로 어필할 줄 압니다. 복잡한 생각보다는 몸으로 부딪히는 액티비티나 화끈한 데이트를 선호합니다. 갈등 시에도 뒤끝 없이 시원시원하게 해결하려는 모습을 보입니다.",
        "strengths": ["밝고 쾌활한 에너지", "뛰어난 적응력과 문제 해결력", "솔직하고 직설적인 소통"],
        "weaknesses": ["충동적인 결정", "미래에 대한 진지함 부족", "상대방의 섬세한 감정을 놓칠 때가 있음"],
        "advice": "가끔은 화려한 활동보다 조용한 대화의 시간이 필요합니다. 상대방의 깊은 내면과 감정 변화를 들여다보는 인내심을 가져보세요.",
        "partner": "ISFJ",
        "partnerTitle": "용감한 수호자",
        "caution": "INFJ",
        "cautionTitle": "선의의 옹호자"
    },
    "ESFP": {
        "title": "매일이 축제 같은 분위기 메이커",
        "description": "사랑을 온몸으로 표현하고 즐기는 긍정적인 에너지 타입입니다.",
        "datingStyle": "당신은 연인과 함께 있는 시간 자체를 하나의 파티처럼 즐겁게 만듭니다. 다정다감하고 사교적인 성향으로 주변 사람들까지 행복하게 하며, 연인에게 아낌없이 애정을 표현합니다. 지루하거나 반복되는 일상보다는 서프라이즈와 새로운 경험을 통해 사랑을 확인합니다.",
        "strengths": ["탁월한 사교성과 낙천주의", "다정하고 따뜻한 스킨십과 표현", "상대방에게 활력을 주는 편안함"],
        "weaknesses": ["충동적 지출이나 계획성 부족", "진지한 갈등을 피하려고만 함", "외부 자극에 쉽게 눈을 돌릴 수 있음"],
        "advice": "반복되는 일상도 사랑의 소중한 부분입니다. 자극적이지 않더라도 평범한 시간을 견디고 즐길 줄 아는 깊이 있는 관계를 지향해 보세요.",
        "partner": "ISTJ",
        "partnerTitle": "청렴결백한 논리주의자",
        "caution": "INTJ",
        "cautionTitle": "용의주도한 전략가"
    },
    "ENFP": {
        "title": "사랑에 올인하는 정열의 댕댕이",
        "description": "풍부한 상상력과 인간미로 연인을 매료시키는 스타일입니다.",
        "datingStyle": "당신은 사랑에 매우 열정적이며, 한 번 빠지면 세상을 다 줄 것 같은 헌신을 보입니다. 연인과의 관계에서 끊임없이 새로운 의미와 로망을 찾으려 노력하며, 풍부하고 감성적인 표현으로 상대방을 행복하게 합니다. 자유로운 영혼인 만큼 자신을 구속하지 않는 관계를 원합니다.",
        "strengths": ["열정적이고 창의적인 사랑", "매우 깊고 섬세한 공감력", "긍정적이고 희망찬 분위기 형성"],
        "weaknesses": ["쉽게 실증을 느끼기도 함", "지나치게 감정에 휘둘리는 성향", "현실적인 관리와 계획 부재"],
        "advice": "첫눈에 반하는 뜨거운 감정도 좋지만, 시간이 지나며 다져지는 은근한 신뢰의 가치도 느껴보세요. 감정이 식는 것이 아니라, 관계가 깊어지는 과정입니다.",
        "partner": "INFJ",
        "partnerTitle": "선의의 옹호자",
        "caution": "ISTP",
        "cautionTitle": "만능 재주꾼"
    },
    "ENTP": {
        "title": "티키타카가 예술인 매력 만점 변론가",
        "description": "지적 유머와 끊임없는 호기심으로 연애를 주도하는 타입입니다.",
        "datingStyle": "당신은 지루한 연애를 가장 싫어합니다. 연인과 말싸움을 하듯 장난을 치며 지적인 배틀을 즐기는 것이 당신만의 사랑 표현입니다. 독창적인 데이트 코스를 짜는 데 능숙하며, 고정관념에서 벗어난 자유로운 관계를 추구합니다. 당신을 자극하고 성장시키는 사람에게 강한 끌림을 느낍니다.",
        "strengths": ["재치 있고 설득력 있는 소통", "빠른 두뇌 회전과 창의성", "뒤끝 없고 솔직한 태도"],
        "weaknesses": ["논쟁적인 태도로 인한 갈등 유발", "감정적인 공감보다 비판이 앞섬", "끈기 없는 연애(쉽게 질림)"],
        "advice": "옳고 그른 것을 가리는 것보다, 연인의 감정을 먼저 수용해 주는 인내심을 길러보세요. 사랑은 싸워서 이기는 게임이 아닙니다.",
        "partner": "INTJ",
        "partnerTitle": "용의주도한 전략가",
        "caution": "ISFJ",
        "cautionTitle": "용감한 수호자"
    },
    "ESTJ": {
        "title": "든든하고 명확한 가이드 스타일",
        "description": "체계적인 리더십으로 관계를 안정적으로 이끄는 타입입니다.",
        "datingStyle": "당신은 연애에서도 확실한 계획과 신뢰를 중요하게 여깁니다. 데이트 시간 엄수, 앞날에 대한 명확한 약속 등 당신의 사랑은 매우 구체적이고 실질적입니다. 감정적인 밀당보다는 솔직하고 투명한 관계를 원하며, 연인이 어려운 상황에 처했을 때 가장 먼저 나서서 해결책을 제시해 줍니다.",
        "strengths": ["확실한 주관과 책임감", "가정생활이나 미래에 대한 안정감", "솔직하고 명확한 의사표현"],
        "weaknesses": ["통제하거나 가르치려는 성향", "감정적인 공감 결여", "고집스럽고 보수적인 태도"],
        "advice": "연인은 당신의 지시를 따라야 할 대상이 아니라, 함께 걸어가야 할 동반자입니다. 정답을 보여주기보다 상대의 속도에 맞춰주는 여유를 가져보세요.",
        "partner": "ISFP",
        "partnerTitle": "호기심 많은 예술가",
        "caution": "INFP",
        "cautionTitle": "열정적인 중재자"
    },
    "ESFJ": {
        "title": "따뜻하고 배려 깊은 다정한 연인",
        "description": "사교적인 매력으로 조화로운 연애를 추구하는 타입입니다.",
        "datingStyle": "주변 사람들과의 관계를 중시하며, 연인에게 인정받고 사랑받을 때 가장 큰 행복을 느낍니다. 다정다감하고 세심하여 기념일을 완벽하게 챙기며, 연인의 가족이나 친구들까지 살피는 섬세함을 보입니다. 갈등 없이 평화롭고 따스한 관계를 유지하기 위해 자신의 에너지를 아낌없이 씁니다.",
        "strengths": ["친절하고 사교적인 성격", "매우 가정적이고 헌신적인 태도", "조화롭고 안정적인 관계 지향"],
        "weaknesses": ["타인의 평가에 지나치게 민감함", "갈등을 회피하고 참으려고만 함", "집착이나 구속으로 보일 수 있는 케어"],
        "advice": "모두에게 친절하기 위해 당신의 에너지를 소모하지 마세요. 가장 소중한 당신 자신을 먼저 돌볼 때, 연인과의 관계도 진정으로 건강해집니다.",
        "partner": "ISTP",
        "partnerTitle": "만능 재주꾼",
        "caution": "INTJ",
        "cautionTitle": "용의주도한 전략가"
    },
    "ENFJ": {
        "title": "성장을 지원하는 정의로운 멘토",
        "description": "타인의 행복에 진심이며, 헌신적으로 사랑하는 타입입니다.",
        "datingStyle": "당신은 연애에서도 상대방의 잠재력을 믿고 성장을 돕는 멘토 역할을 자처합니다. 매우 이타적이고 표현이 풍부하여 연인에게 끝없는 지지와 격려를 보냅니다. 하지만 온 마음을 다하는 만큼 상대방의 무관심이나 비판에 큰 상처를 받기도 하며, 관계의 이상향을 강하게 추구합니다.",
        "strengths": ["탁월한 공감력과 리더십", "열정적이고 헌신적인 태도", "품격 있고 정의로운 연애관"],
        "weaknesses": ["지나치게 상대방에게 맞추는 성향", "사소한 갈등에도 크게 상처받음", "통제하려는 것으로 보일 수 있는 헌신"],
        "advice": "상대방의 성장도 중요하지만, 가끔은 부족하고 실수하는 모습 그대로를 사랑해 주세요. 완벽하게 키우는 사랑보다 지켜보는 사랑이 더 깊을 때가 있습니다.",
        "partner": "INFP",
        "partnerTitle": "열정적인 중재자",
        "caution": "ISTP",
        "cautionTitle": "만능 재주꾼"
    },
    "ENTJ": {
        "title": "미래를 함께 개척할 전략가",
        "description": "에너지 넘치는 추진력으로 연애를 주도하는 리더 타입입니다.",
        "datingStyle": "연애에서도 목표 지향적이고 야심 찬 모습을 보입니다. 지적이고 능력 있는 사람에게 매력을 느끼며, 서로 시너지를 내어 발전하는 관계를 꿈꿉니다. 감정적인 변덕이나 비효율적인 싸움을 싫어하며, 문제가 생기면 즉각적이고 합리적인 해결책을 찾아 실행에 옮깁니다.",
        "strengths": ["확고한 비전과 추진력", "지적인 자극과 성취 공유", "솔직하고 뒤끝 없는 뒤처리"],
        "weaknesses": ["권위적이거나 고집스러운 면모", "감정적인 공감에 서투름", "일 중심적인 생활로 인한 소홀함"],
        "advice": "모든 것을 해결하려고만 하지 마세요. 가끔은 아무런 해결책 없이 연인의 눈을 맞추고 이야기를 들어주는 것만으로도 충분합니다.",
        "partner": "INTP",
        "partnerTitle": "논리적인 사색가",
        "caution": "ISFP",
        "cautionTitle": "호기심 많은 예술가"
    }
};

export function LoveMBTI() {
    const [step, setStep] = useState<'intro' | 'question' | 'result'>('intro');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({ 'E': 0, 'I': 0, 'S': 0, 'N': 0, 'T': 0, 'F': 0, 'J': 0, 'P': 0 });
    const [finalMBTI, setFinalMBTI] = useState<string>('');
    const reportRef = useRef<HTMLDivElement>(null);

    const handleAnswer = (type: string) => {
        setAnswers(prev => ({
            ...prev,
            [type]: prev[type] + 1
        }));

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    useEffect(() => {
        if (currentIndex === questions.length - 1 && Object.values(answers).reduce((a, b) => a + b, 0) === questions.length) {
            const mbti =
                (answers['E'] >= answers['I'] ? 'E' : 'I') +
                (answers['S'] >= answers['N'] ? 'S' : 'N') +
                (answers['T'] >= answers['F'] ? 'T' : 'F') +
                (answers['J'] >= answers['P'] ? 'J' : 'P');
            setFinalMBTI(mbti);
            setStep('result');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [answers, currentIndex]);

    const handleSaveImage = async () => {
        if (!reportRef.current) return;
        try {
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                logging: false,
                ignoreElements: (element) => element.classList.contains('no-capture')
            });
            const link = document.createElement('a');
            link.download = `love-mbti-${finalMBTI}-${new Date().getTime()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            alert('이미지 저장 중 오류가 발생했습니다.');
        }
    };

    const handleKakaoShare = () => {
        if (typeof window !== 'undefined' && (window as any).Kakao) {
            const Kakao = (window as any).Kakao;
            if (!Kakao.isInitialized()) Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY);

            const url = window.location.origin + '/?tab=tests';
            const resultData = results[finalMBTI];

            Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `나의 연애 MBTI는? [${resultData.title}]`,
                    description: resultData.description,
                    imageUrl: 'https://man-woman-analysis-report.vercel.app/og-mbti.png',
                    link: { mobileWebUrl: url, webUrl: url },
                },
                buttons: [{ title: '나도 테스트하기', link: { mobileWebUrl: url, webUrl: url } }],
            });
        }
    };

    if (step === 'intro') {
        return (
            <div className="max-w-2xl mx-auto py-10 px-4">
                <Card className="border-2 border-pink-100 shadow-xl overflow-hidden rounded-[40px] bg-gradient-to-b from-pink-50 to-white">
                    <div className="p-8 sm:p-12 text-center">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner text-4xl animate-pulse">
                            💖
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">연애로 보는 내 MBTI</h2>
                        <p className="text-pink-600 font-bold mb-8 italic">"기존 MBTI와 연애 MBTI는 다를 수 있습니다"</p>

                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-10 text-left border border-white">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-orange-400" /> 테스트 가이드
                            </h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• 총 40개의 문항으로 당신의 연애 성향을 섬세하게 분석합니다.</li>
                                <li>• 솔직하고 즉흥적인 답변이 더 정확한 결과를 만듭니다.</li>
                                <li>• 친구나 연인과 함께 결과를 공유하며 비교해보세요!</li>
                            </ul>
                        </div>

                        <Button
                            onClick={() => setStep('question')}
                            className="w-full bg-pink-600 hover:bg-pink-500 text-white rounded-full py-8 text-xl font-bold shadow-lg transition-all hover:scale-[1.02]"
                        >
                            테스트 시작하기 <ChevronRight className="ml-2 w-6 h-6" />
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (step === 'question') {
        const progress = ((currentIndex + 1) / questions.length) * 100;
        const currentQuestion = questions[currentIndex];

        return (
            <div className="max-w-2xl mx-auto py-10 px-4">
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-pink-600 font-black text-2xl">{currentIndex + 1} <span className="text-gray-300 text-lg font-normal">/ {questions.length}</span></span>
                        <span className="text-gray-400 text-sm font-medium">{Math.round(progress)}% 완료</span>
                    </div>
                    {/* Custom Progress Bar */}
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-pink-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-10 text-center leading-tight min-h-[4rem] flex items-center justify-center px-4">
                    {currentQuestion.question}
                </h3>

                <div className="space-y-4">
                    {currentQuestion.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(option.type)}
                            className="w-full p-6 text-left bg-white border-2 border-gray-100 rounded-3xl hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 group relative overflow-hidden"
                        >
                            <span className="relative z-10 text-gray-700 font-medium group-hover:text-pink-700 transition-colors">
                                {option.text}
                            </span>
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Heart className="w-5 h-5 text-pink-300 fill-pink-300" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const resultData = results[finalMBTI];

    return (
        <div className="max-w-3xl mx-auto py-10 px-4" ref={reportRef}>
            <div className="text-center mb-10 no-capture">
                <Badge className="bg-pink-100 text-pink-600 border-pink-200 px-4 py-1 rounded-full mb-4">테스트 결과</Badge>
                <h3 className="text-4xl font-bold text-gray-900 font-serif">당신의 연애 MBTI는?</h3>
            </div>

            <Card className="border-2 border-gray-100 shadow-2xl rounded-[50px] overflow-hidden bg-white">
                <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-12 text-center text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="text-7xl mb-6 relative z-10 drop-shadow-lg">✨</div>
                    <h2 className="text-5xl font-black mb-2 relative z-10 tracking-widest">{finalMBTI}</h2>
                    <p className="text-2xl font-bold opacity-90 relative z-10">"{resultData.title}"</p>
                </div>

                <CardContent className="p-8 sm:p-12">
                    <div className="mb-10 text-center">
                        <p className="text-gray-600 leading-relaxed text-lg italic">
                            {resultData.description}
                        </p>
                    </div>

                    <div className="mb-12">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-xl">
                            <Target className="w-6 h-6 text-pink-500" /> 연애 스타일 심층 분석
                        </h4>
                        <div className="bg-gray-50 rounded-[30px] p-8 border border-gray-100">
                            <p className="text-gray-700 leading-loose text-lg">
                                {resultData.datingStyle}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="space-y-6">
                            <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
                                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-blue-500" /> 연애 강점 (Strength)
                                </h4>
                                <ul className="space-y-3">
                                    {resultData.strengths.map((f: string, i: number) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="text-blue-400 mt-1">✔</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100">
                                <h4 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-orange-500" /> 주의할 점 (Weakness)
                                </h4>
                                <ul className="space-y-3">
                                    {resultData.weaknesses.map((f: string, i: number) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="text-orange-400 mt-1">⚠</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="bg-pink-50 rounded-[40px] p-8 border border-pink-100 text-center flex-1 flex flex-col justify-center">
                                <h4 className="font-bold text-pink-900 mb-6 flex items-center justify-center gap-2">
                                    <Heart className="w-5 h-5 text-pink-500 fill-pink-500" /> 환상의 커플 (Best Match)
                                </h4>
                                <div className="text-4xl font-black text-pink-600 mb-2">{resultData.partner}</div>
                                <div className="text-base text-pink-400 font-bold tracking-tight">"{resultData.partnerTitle}"</div>
                            </div>
                            <div className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 text-center flex-1 flex flex-col justify-center">
                                <h4 className="font-bold text-gray-500 mb-6 flex items-center justify-center gap-2 font-serif uppercase tracking-widest text-xs">
                                    조금 더 노력이 필요한 유형
                                </h4>
                                <div className="text-3xl font-bold text-gray-400 mb-1">{resultData.caution}</div>
                                <div className="text-sm text-gray-400">"{resultData.cautionTitle}"</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 rounded-3xl p-8 mb-12 border border-purple-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Anchor className="w-20 h-20 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2 text-lg">
                            <Sparkles className="w-5 h-5 text-purple-500" /> 당신을 위한 연애 조언
                        </h4>
                        <p className="text-purple-800 leading-relaxed font-medium relative z-10">
                            {resultData.advice}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 no-capture">
                        <Button
                            onClick={handleSaveImage}
                            variant="secondary"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-none rounded-full py-7 flex-1 flex items-center justify-center gap-2 font-bold"
                        >
                            <Download className="w-5 h-5" /> 리포트 저장
                        </Button>
                        <Button
                            onClick={handleKakaoShare}
                            className="bg-[#FEE500] hover:bg-[#F4DC00] text-[#3c1e1e] rounded-full py-7 flex-[2] flex items-center justify-center gap-2 shadow-lg font-bold"
                        >
                            <MessageCircle className="w-6 h-6 fill-current" /> 카카오톡으로 공유하기
                        </Button>
                    </div>

                    <div className="mt-8 text-center no-capture">
                        <button
                            onClick={() => { setStep('intro'); setCurrentIndex(0); setAnswers({ 'E': 0, 'I': 0, 'S': 0, 'N': 0, 'T': 0, 'F': 0, 'J': 0, 'P': 0 }); }}
                            className="text-gray-400 text-sm hover:text-gray-600 flex items-center justify-center gap-1 mx-auto transition-colors"
                        >
                            <RefreshCw className="w-3 h-3" /> 테스트 다시 처음부터 하기
                        </button>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-12 text-center text-gray-400 text-xs no-capture">
                <p>© 2026 남녀분석보고서 | 연애 심리학 연구소</p>
                <p className="mt-1">본 결과는 연애 상황에 따른 성향 분석으로 실제 MBTI와 차이가 있을 수 있습니다.</p>
            </div>
        </div>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${className}`}>
            {children}
        </span>
    );
}
