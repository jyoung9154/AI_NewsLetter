'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Sparkles, Heart, Share2, Download, MessageCircle, RefreshCw, ChevronRight, Zap, Target, Shield, Flame, Anchor } from 'lucide-react';
import html2canvas from 'html2canvas';
import { questions, Question } from '@/data/loveMBTIQuestions';

const results: Record<string, any> = {
    "ISTJ": {
        "title": "현실적인 사랑의 수호자",
        "description": "연애에서도 책임감과 신뢰를 가장 중요하게 생각하는 타입입니다.",
        "datingStyle": "당신은 한눈에 불붙는 사랑보다는 천천히 신뢰를 쌓아가는 신중한 연애를 선호합니다. 연인에게 가장 의지가 되는 든든한 나무와 같은 존재이며, 말보다는 행동으로 자신의 마음을 증명합니다. 약속 시간 준수, 계획된 데이트 등 안정적인 환경에서 행복을 느깁니다.",
        "strengths": ["높은 책임감과 성실함", "안정적이고 예측 가능한 관계 유지", "현실적이고 실질적인 도움 제공"],
        "weaknesses": ["감정 표현에 다소 서툶", "변화나 돌발 상황에 대한 스트레스", "보수적인 연애관으로 인한 답답함"],
        "advice": "효율성과 정답을 찾는 데 익숙한 당신이지만, 연애만큼은 때로 비효율적이어도 괜찮다는 사실을 기억하세요. 상대방이 고민을 털어놓을 때 즉각적인 해결책을 제시하기보다, 먼저 상대의 감정에 깊이 공감해주는 연습이 필요합니다. 완벽한 데이트 계획도 좋지만, 가끔은 계획에 없는 돌발 상황조차 연인과 함께라면 즐거운 추억이 될 수 있다는 유연한 마음가짐을 가져보세요. 당신의 성실함은 큰 장점이지만, 상대는 당신의 따뜻한 말 한마디와 다정한 눈빛을 더 갈구할 수 있습니다. 자신의 원칙을 고수하기보다 상대의 입장에서도 한 번 더 생각해보는 배려가 관계를 더 단단하게 만들 것입니다.",
        "partner": "ESFP",
        "partnerTitle": "분위기 메이커 자유 영혼",
        "caution": "ENFP",
        "cautionTitle": "열정적인 몽상가",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_ISTJ.jpg"
    },
    "ISFJ": {
        "title": "아낌없이 주는 사랑꾼",
        "description": "상대방의 행복이 나의 행복이 되는, 세심한 배려의 끝판왕입니다.",
        "datingStyle": "연인의 사소한 습관 하나까지 기억해주는 섬세함을 가졌습니다. 상대방을 위해 무언가를 해줄 때 가장 큰 기쁨을 느끼며, 헌신적인 사랑을 합니다. 갈등을 피하려는 경향이 있어 가끔은 속마음을 숨기기도 하지만, 내 편이 생겼다는 확신이 들면 끝없는 지지를 보냅니다.",
        "strengths": ["뛰어난 기억력과 세심한 케어", "가정적이고 헌신적인 태도", "부드럽고 온화한 소통 방식"],
        "weaknesses": ["본인의 서운함을 잘 표현하지 못함", "거절을 어려워함", "변화에 대한 두려움"],
        "advice": "타인의 감정을 살피느라 정작 자신의 마음은 소홀히 하고 있지는 않은지 돌아보세요. 상대방에게 맞추는 것만이 사랑의 전부는 아니며, 당신이 느끼는 섭섭함이나 원하는 바를 솔직하게 표현할 때 비로소 건강한 관계가 유지됩니다. 헌신이 당연하게 여겨지지 않도록 자신만의 경계선을 설정하고, 상대방이 당신의 노력을 알아줄 때까지 기다리기보다 먼저 당신의 가치를 전달해보세요. 갈등을 회피하기 위해 문제를 덮어두는 것은 나중에 더 큰 오해를 불러올 수 있으니, 작은 불편함부터 소통하는 용기가 필요합니다. 당신은 충분히 사랑받을 자격이 있는 사람임을 잊지 말고, 자신을 먼저 아껴주는 연습을 하세요.",
        "partner": "ESTP",
        "partnerTitle": "수완 좋은 활동가",
        "caution": "ENTP",
        "cautionTitle": "뜨거운 논쟁을 즐기는 변론가",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_ISFJ.jpg"
    },
    "INFJ": {
        "title": "영혼의 단짝을 찾는 소통가",
        "description": "겉은 차분해 보이지만 속은 누구보다 뜨거운 로맨티스트입니다.",
        "datingStyle": "당신에게 연애는 단순한 만남 이상으로, 정신적으로 깊이 연결된 '영혼의 파트너'를 찾는 과정입니다. 상대방의 가치관과 내면을 중시하며, 깊이 있는 대화가 통할 때 가장 큰 매력을 느낍니다. 자신만의 기준이 확고하여 연애를 시작하기까지 오랜 시간이 걸리기도 합니다.",
        "strengths": ["깊은 공감 능력과 통찰력", "일대일 관계에서의 완전한 몰입", "상대방의 잠재력을 이끌어내는 지지"],
        "weaknesses": ["높은 기대치로 인한 실망", "속마음을 알기 어려운 신비주의", "갈등 상황에서 극도로 예민해짐"],
        "advice": "이상적인 '영혼의 단짝'을 찾는 당신의 기준은 매우 높지만, 현실의 인간은 누구나 결점을 가지고 있다는 사실을 너그럽게 받아들여 보세요. 상대방이 당신의 복잡한 내면을 한 번에 다 이해하지 못한다고 해서 실망하기보다, 당신의 마음을 조금씩 더 구체적이고 명확하게 설명해주는 노력이 필요합니다. 혼자만의 생각에 빠져 결론을 내리기 전에 연인과 소통하며 함께 답을 찾아가는 과정이 관계의 신뢰를 더 높여줄 것입니다. 지나치게 미래를 걱정하거나 관계의 의미를 분석하기보다, 지금 이 순간 상대와 나누는 소소한 즐거움에 더 집중해보세요. 당신의 깊은 통찰력을 상대가 부담스러워하지 않도록 가끔은 가볍고 즐거운 대화로 분위기를 환기시키는 것도 중요합니다.",
        "partner": "ENFP",
        "partnerTitle": "재기발랄한 활동가",
        "caution": "ESTP",
        "cautionTitle": "수완 좋은 활동가",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_INFJ.jpg"
    },
    "INTJ": {
        "title": "지적인 성장을 함께할 설계자",
        "description": "사랑도 분석하고 계획하는, 이성적인 로맨티스트입니다.",
        "datingStyle": "당신은 사랑에서도 지적인 자극과 배울 점을 중요하게 생각합니다. 단순히 즐거운 데이트보다는 함께 미래를 설계하고 성장할 수 있는 파트너를 원합니다. 감정 과잉이나 드라마틱한 감정싸움을 매우 소모적으로 느끼며, 효율적이고 명확한 소통을 선호합니다.",
        "strengths": ["독립적이고 주체적인 태도", "장기적인 관계에 대한 비전", "논리적이고 명확한 갈등 해결"],
        "weaknesses": ["차갑거나 무심해 보일 수 있음", "감정적인 공감이 다소 부족함", "자신의 방식을 고수하려는 고집"],
        "advice": "사랑을 머리로 이해하려 하기보다 가슴으로 느끼는 시간을 더 가져보세요. 논리적인 분석과 효율적인 소통도 중요하지만, 연애에서는 때때로 아무 이유 없는 다정함과 감정적인 지지가 훨씬 더 큰 힘을 발휘합니다. 상대방의 감정 섞인 호소를 논리적 오류로 지적하지 말고, 그 마음 자체를 있는 그대로 수용해주는 공감 능력을 키우는 것이 핵심입니다. 당신의 높은 기준을 연인에게도 똑같이 적용하여 무언중에 압박을 주고 있지는 않은지 스스로를 점검해보세요. 독립적인 성향은 좋지만, 가끔은 취약한 모습도 보여주며 상대방이 당신을 도와줄 수 있는 기회를 주는 것이 친밀감을 높이는 지름길입니다. 미래에 대한 완벽한 설계도 중요하지만, 현재의 감정을 놓치지 않도록 주의하세요.",
        "partner": "ENTP",
        "partnerTitle": "뜨거운 논쟁을 즐기는 변론가",
        "caution": "ESFJ",
        "cautionTitle": "사교적인 외교관",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_INTJ.jpg"
    },
    "ISTP": {
        "title": "쿨하고 담백한 자유로운 연인",
        "description": "구속 없는 자유와 즐거운 경험이 중요한 '현재 중심적' 타입입니다.",
        "datingStyle": "말보다는 행동으로 사랑을 보여주는 타입입니다. 감정 표현이 다소 무뚝뚝할 수 있지만, 연인이 필요할 때 가장 실질적인 도움을 주는 사람이기도 합니다. 각자의 개인 시간과 공간을 매우 중요하게 생각하며, 너무 잦은 연락이나 감정적인 요구에 답답함을 느낍니다.",
        "strengths": ["적응력이 좋고 유연함", "부담스럽지 않은 쿨한 연애", "위기 상황에서의 냉철한 해결"],
        "weaknesses": ["회피적인 태도(갈등 시 잠수)", "무심해 보일 수 있는 반응", "미래에 대한 진지한 고민 부재"],
        "advice": "당신만의 자유와 공간을 존중받고 싶은 만큼, 상대방이 원하는 정서적 연결과 안정감에 대해서도 진지하게 고려해봐야 합니다. 갈등이 생겼을 때 귀찮다는 이유로 회피하거나 침묵하기보다, 서투르더라도 지금의 기분을 말로 표현하는 연습이 관계의 파국을 막아줍니다. 무뚝뚝함이 쿨함으로 오해받을 수 있지만, 연인은 당신의 따뜻한 확신과 구체적인 애정 표현을 기다리고 있을지 모릅니다. 매 순간의 즐거움도 좋지만 관계의 지속성을 위해 가끔은 함께 미래를 꿈꾸고 계획하는 진지한 태도를 보여주는 것도 필요합니다. 당신의 효율적인 해결 능력을 칭찬하되, 상대가 원하는 것이 해결책이 아닌 따뜻한 위로일 때가 많다는 점을 잊지 마세요.",
        "partner": "ESFJ",
        "partnerTitle": "사교적인 외교관",
        "caution": "ENFJ",
        "cautionTitle": "정의로운 사회운동가",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_ISTP.jpg"
    },
    "ISFP": {
        "title": "감수성 풍부한 평화주의자",
        "description": "따뜻한 감성과 배려로 연인을 감싸는 로맨티시스트입니다.",
        "datingStyle": "당신은 연애에서 '지금 이 순간'의 행복과 조화를 무엇보다 중시합니다. 예술적 감각이 뛰어나 데이트 코스나 선물을 고를 때 센스가 돋보입니다. 비판에 민감하고 갈등을 싫어하여 상대방에게 잘 맞춰주지만, 혼자서 상처를 쌓아두다가 한꺼번에 터뜨리기도 합니다.",
        "strengths": ["다정다감하고 포용력이 넓음", "예술적 감성과 센스", "상대방의 가치를 존중함"],
        "weaknesses": ["결단력 부족", "갈등을 회피하려는 성향", "미래에 대한 구체적 계획 부재"],
        "advice": "상대방의 기분을 살피느라 당신의 정체성을 잃어버리지 않도록 항상 주의하세요. 거절이 어렵고 갈등이 싫어서 참기만 하다가 어느 순간 갑자기 이별을 결심하는 방식은 상대에게 큰 상처가 될 뿐만 아니라 문제 해결에 도움이 되지 않습니다. 당신의 섬세한 감각과 다정함은 최고의 선물이지만, 때로는 관계를 주도적으로 이끌어가는 결단력 있는 모습도 보여줄 필요가 있습니다. 막연한 로맨틱함에 기대기보다 현실적인 문제들(돈, 진로, 생활 방식 등)에 대해 연인과 진지하게 대화하고 합의점을 찾아가는 노력이 필요합니다. 혼자만의 동굴에서 상처를 치유하기보다 연인에게 손을 내밀어 함께 극복해 나가는 경험을 쌓아보세요.",
        "partner": "ESTJ",
        "partnerTitle": "엄격한 관리자",
        "caution": "ENTJ",
        "cautionTitle": "대담한 전략가",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_ISFP.jpg"
    },
    "INFP": {
        "title": "순수하고 이상적인 몽상가",
        "description": "사랑에 대한 깊은 가치와 의미를 부여하는 헌신적인 타입입니다.",
        "datingStyle": "당신은 세상 어딘가에 있을 '운명적인 사랑'을 믿으며, 연인에게 자신의 모든 것을 보여주고 싶어 합니다. 풍부한 상상력과 감수성으로 연애를 한 편의 소설처럼 아름답게 가꾸려 노력합니다. 하지만 현실적인 문제에 직면할 때 상상 속의 연애와 괴리를 느끼며 힘들어하기도 합니다.",
        "strengths": ["무한한 지지와 따뜻함", "매우 깊고 진실한 공감력", "창의적이고 특별한 사랑 표현"],
        "weaknesses": ["현실적이지 못한 이상 추구", "지나치게 감정에 휩쓸림", "비판을 개인적인 공격으로 받아들임"],
        "advice": "상상 속의 완벽한 사랑과 현실의 연애 사이에서 오는 괴리감을 인정하고, 상대의 부족함조차 사랑의 일부로 받아들이는 성숙함이 필요합니다. 지나치게 감정에 매몰되어 사소한 비판에도 크게 상처받거나 관계 전체를 의심하기보다, 이성적인 관점에서 상황을 객관적으로 바라보려는 노력을 병행하세요. 당신의 헌신과 순수함은 아름답지만, 상대가 감당하기 버거울 정도의 감정적 요구를 하고 있지는 않은지 가끔은 돌아봐야 합니다. 갈등 상황에서 침묵으로 일관하거나 혼자 결론을 내리기보다, 당신의 복잡한 감정들을 상대가 이해할 수 있는 언어로 번역해서 전달해보세요. 현재의 행복을 만끽하기 위해 과거의 상처나 미래의 불안을 잠시 내려놓는 연습이 중요합니다.",
        "partner": "ENFJ",
        "partnerTitle": "정의로운 사회운동가",
        "caution": "ESTJ",
        "cautionTitle": "엄격한 관리자",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_INFP.jpg"
    },
    "INTP": {
        "title": "사랑도 탐구하는 지적인 모험가",
        "description": "호기심 많고 독특한 시선으로 상대를 탐구하는 스타일입니다.",
        "datingStyle": "당신에게 연애는 또 하나의 흥미로운 탐험 주제입니다. 상대방의 사고방식과 지식에 매력을 느끼며, 뻔한 데이트보다는 독특하고 의미 있는 경험을 선호합니다. 감정 표현에는 다소 인색해 보일 수 있지만, 당신만의 논리적인 방식으로 상대방을 아끼고 존중하고 있습니다.",
        "strengths": ["편견 없는 개방된 사고", "독창적이고 유머러스함", "독립적이고 뒤끝 없는 성격"],
        "weaknesses": ["공감보다는 분석이 앞섬", "지적 거만함으로 오해받을 수 있음", "연락이나 약속에 다소 소홀함"],
        "advice": "상대방의 감정을 분석의 대상으로 삼지 말고 공감과 수용의 태도로 대하려 노력해보세요. '왜' 그런 감정을 느끼는지 논리적으로 파악하기보다, 그냥 그런 감정을 느낀다는 사실 자체를 존중해주는 것이 연애의 핵심입니다. 당신에게는 익숙한 비판적인 시각과 지적 유머가 연인에게는 차가운 칼날처럼 느껴질 수 있음을 항상 의식하며 부드러운 화법을 연습해야 합니다. 자신의 생각 속에 갇혀 연인과의 소통이나 연락을 소홀히 하지 않도록 규칙적인 표현을 습관화하는 것도 좋은 방법입니다. 효율적이지 않더라도 연인이 좋아하는 활동에 기꺼이 동참하며 시간을 함께 보내는 것만으로도 충분히 사랑을 전할 수 있습니다. 지적인 자극만큼이나 따뜻한 체온과 정서적 교감이 중요하다는 것을 잊지 마세요.",
        "partner": "ENTJ",
        "partnerTitle": "대담한 전략가",
        "caution": "ESFJ",
        "cautionTitle": "사교적인 외교관",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_INTP.jpg"
    },
    "ESTP": {
        "title": "활동적이고 정열적인 모험가",
        "description": "지루할 틈 없는 역동적인 데이트를 주도하는 타입입니다.",
        "datingStyle": "당신과의 연애는 항상 새롭고 짜릿합니다. 현재의 즐거움에 매우 솔직하며, 자신의 매력을 적극적으로 어필할 줄 압니다. 복잡한 생각보다는 몸으로 부딪히는 액티비티나 화끈한 데이트를 선호합니다. 갈등 시에도 뒤끝 없이 시원시원하게 해결하려는 모습을 보입니다.",
        "strengths": ["밝고 쾌활한 에너지", "뛰어난 적응력과 문제 해결력", "솔직하고 직설적인 소통"],
        "weaknesses": ["충동적인 결정", "미래에 대한 진지함 부족", "상대방의 섬세한 감정을 놓칠 때가 있음"],
        "advice": "현재의 즐거움과 신나는 모험도 좋지만, 관계가 깊어지기 위해서는 진지하고 깊이 있는 대화의 시간도 반드시 필요합니다. 갈등 상황을 단순히 가볍게 넘기거나 직설적인 화법으로 상대에게 상처를 주기보다, 상대의 섬세한 감정선을 세심하게 읽어주는 인내심을 길러보세요. 충동적인 결정으로 인해 발생하는 문제들이 반복되지 않도록 관계의 장기적인 비전을 연인과 함께 공유하고 조율하는 노력이 중요합니다. 당신의 에너지가 넘치는 활동적인 데이트도 좋지만, 가끔은 정적인 분위기에서 서로의 내면을 들여다보는 시간을 가져보세요. 사랑의 열정은 금방 타오르지만, 신뢰는 꾸준한 성실함과 일관성 있는 행동을 통해 쌓이는 것임을 명심해야 합니다.",
        "partner": "ISFJ",
        "partnerTitle": "용감한 수호자",
        "caution": "INFJ",
        "cautionTitle": "선의의 옹호자",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_ESTP.jpg"
    },
    "ESFP": {
        "title": "매일이 축제 같은 분위기 메이커",
        "description": "사랑을 온몸으로 표현하고 즐기는 긍정적인 에너지 타입입니다.",
        "datingStyle": "당신은 연인과 함께 있는 시간 자체를 하나의 파티처럼 즐겁게 만듭니다. 다정다감하고 사교적인 성향으로 주변 사람들까지 행복하게 하며, 연인에게 아낌없이 애정을 표현합니다. 지루하거나 반복되는 일상보다는 서프라이즈와 새로운 경험을 통해 사랑을 확인합니다.",
        "strengths": ["탁월한 사교성과 낙천주의", "다정하고 따뜻한 스킨십과 표현", "상대방에게 활력을 주는 편안함"],
        "weaknesses": ["충동적 지출이나 계획성 부족", "진지한 갈등을 피하려고만 함", "외부 자극에 쉽게 눈을 돌릴 수 있음"],
        "advice": "지루함이나 반복되는 일상을 견디는 힘을 기르고, 순간적인 자극보다 깊은 내면의 유대감을 쌓는 데 더 집중해보세요. 갈등이 생겼을 때 분위기를 띄워 슬쩍 넘기려 하기보다, 진지하게 문제의 핵심을 짚고 대화로 풀어내려는 성숙한 자세가 필요합니다. 타인의 이목이나 화려한 모습에 신경 쓰기보다 오직 두 사람만의 진실한 연결을 유지하는 것에 가치를 두세요. 당신의 낙천주의는 큰 힘이 되지만, 연인의 우울함이나 고민을 너무 쉽게 생각하거나 낙관적으로만 치부하지 않도록 각별히 신경 써야 합니다. 계획성 없는 태도가 상대에게 불안감을 줄 수 있으니, 중요한 미래 계획이나 약속에 대해서는 책임감 있는 모습을 보여주는 것이 좋습니다.",
        "partner": "ISTJ",
        "partnerTitle": "청렴결백한 논리주의자",
        "caution": "INTJ",
        "cautionTitle": "용의주도한 전략가",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_ESFP.jpg"
    },
    "ENFP": {
        "title": "사랑에 올인하는 정열의 댕댕이",
        "description": "풍부한 상상력과 인간미로 연인을 매료시키는 스타일입니다.",
        "datingStyle": "당신은 사랑에 매우 열정적이며, 한 번 빠지면 세상을 다 줄 것 같은 헌신을 보입니다. 연인과의 관계에서 끊임없이 새로운 의미와 로망을 찾으려 노력하며, 풍부하고 감성적인 표현으로 상대방을 행복하게 합니다. 자유로운 영혼인 만큼 자신을 구속하지 않는 관계를 원합니다.",
        "strengths": ["열정적이고 창의적인 사랑", "매우 깊고 섬세한 공감력", "긍정적이고 희망찬 분위기 형성"],
        "weaknesses": ["쉽게 실증을 느끼기도 함", "지나치게 감정에 휘둘리는 성향", "현실적인 관리와 계획 부재"],
        "advice": "금방 뜨거워졌다가 차갑게 식어버리는 감정의 기복을 조절하고, 시간이 흘러도 변치 않는 은근한 신뢰의 가치를 소중히 여기세요. 새로운 자극이나 타인에게 쏠리는 호기심을 경계하고, 지금 곁에 있는 사람과의 관계를 더 깊고 단단하게 다지는 데 에너지를 쏟아야 합니다. 풍부한 상상력으로 관계의 의미를 부여하는 것은 좋지만, 때로는 현실적인 문제들을 외면하지 말고 직시하며 해결해 나가는 힘이 필요합니다. 당신의 자유분방함이 상대에게 불안이나 소외감을 주지 않도록 정해진 규칙을 존중하고 일관성 있게 표현하는 연습을 하세요. 지나치게 감정에 휩쓸려 상대에게 과도한 에너지를 쏟다가 번아웃에 빠지지 않도록 적절한 거리를 유지하는 것도 중요합니다.",
        "partner": "INFJ",
        "partnerTitle": "선의의 옹호자",
        "caution": "ISTP",
        "cautionTitle": "만능 재주꾼",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_ENFP.jpg"
    },
    "ENTP": {
        "title": "티키타카가 예술인 매력 만점 변론가",
        "description": "지적 유머와 끊임없는 호기심으로 연애를 주도하는 타입입니다.",
        "datingStyle": "당신은 지루한 연애를 가장 싫어합니다. 연인과 말싸움을 하듯 장난을 치며 지적인 배틀을 즐기는 것이 당신만의 사랑 표현입니다. 독창적인 데이트 코스를 짜는 데 능숙하며, 고정관념에서 벗어난 자유로운 관계를 추구합니다. 당신을 자극하고 성장시키는 사람에게 강한 끌림을 느낍니다.",
        "strengths": ["재치 있고 설득력 있는 소통", "빠른 두뇌 회전과 창의성", "뒤끝 없고 솔직한 태도"],
        "weaknesses": ["논쟁적인 태도로 인한 갈등 유발", "감정적인 공감보다 비판이 앞섬", "끈기 없는 연애(쉽게 질림)"],
        "advice": "논쟁에서 이기는 것보다 연인의 마음을 얻는 것이 훨씬 중요하다는 사실을 매 순간 기억해야 합니다. 당신의 날카로운 지성과 논리적인 반박이 연인에게는 무시당하는 느낌이나 거부감을 줄 수 있으니, 비판보다는 칭찬과 수용의 언어를 더 많이 사용해보세요. 진지한 대화 상황에서 유머로 넘어가거나 주제를 돌리려 하지 말고, 끝까지 인내심을 갖고 상대의 이야기를 경청하는 태도가 필요합니다. 끈기 부족으로 인해 연애가 짧게 끝나지 않도록, 한 사람과 깊은 유대감을 쌓아가는 과정에서 오는 지적인 즐거움과 평온함을 발견해보세요. 당신의 독창적인 아이디어도 좋지만, 연인이 원하는 안정적이고 예측 가능한 루틴도 어느 정도 맞춰주는 유연함이 필요합니다.",
        "partner": "INTJ",
        "partnerTitle": "용의주도한 전략가",
        "caution": "ISFJ",
        "cautionTitle": "용감한 수호자",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_ENTP.jpg"
    },
    "ESTJ": {
        "title": "든든하고 명확한 가이드 스타일",
        "description": "체계적인 리더십으로 관계를 안정적으로 이끄는 타입입니다.",
        "datingStyle": "당신은 연애에서도 확실한 계획과 신뢰를 중요하게 여깁니다. 데이트 시간 엄수, 앞날에 대한 명확한 약속 등 당신의 사랑은 매우 구체적이고 실질적입니다. 감정적인 밀당보다는 솔직하고 투명한 관계를 원하며, 연인이 어려운 상황에 처했을 때 가장 먼저 나서서 해결책을 제시해 줍니다.",
        "strengths": ["확실한 주관과 책임감", "가정생활이나 미래에 대한 안정감", "솔직하고 명확한 의사표현"],
        "weaknesses": ["통제하거나 가르치려는 성향", "감정적인 공감 결여", "고집스럽고 보수적인 태도"],
        "advice": "연애는 관리하고 통제해야 할 프로젝트가 아니라, 서로의 다름을 존중하며 함께 성숙해가는 신비로운 과정임을 인정하세요. 당신이 생각하는 정답을 상대에게 강요하거나 가르치려 들기보다, 상대의 선택과 방식을 묵묵히 지켜봐 주는 인내심과 관대함이 필요합니다. 효율적인 리더십도 좋지만, 가끔은 취약한 점을 드러내고 도움을 구하며 정서적인 연결을 시도하는 것이 관계를 훨씬 더 인간적으로 만듭니다. 감정적인 공감이 비논리적이라고 생각될지라도, 사랑하는 사람을 위해 기꺼이 공감 버튼을 누르는 유연함을 길러보세요. 당신의 성실한 책임감은 완벽한 장점이니, 거기에 부드러운 유머와 배려심 한 스푼만 얹으면 훨씬 더 매력적인 연인이 될 것입니다.",
        "partner": "ISFP",
        "partnerTitle": "호기심 많은 예술가",
        "caution": "INFP",
        "cautionTitle": "열정적인 중재자",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_ESTJ.jpg"
    },
    "ESFJ": {
        "title": "따뜻하고 배려 깊은 다정한 연인",
        "description": "사교적인 매력으로 조화로운 연애를 추구하는 타입입니다.",
        "datingStyle": "주변 사람들과의 관계를 중시하며, 연인에게 인정받고 사랑받을 때 가장 큰 행복을 느낍니다. 다정다감하고 세심하여 기념일을 완벽하게 챙기며, 연인의 가족이나 친구들까지 살피는 섬세함을 보입니다. 갈등 없이 평화롭고 따스한 관계를 유지하기 위해 자신의 에너지를 아낌없이 씁니다.",
        "strengths": ["친절하고 사교적인 성격", "매우 가정적이고 헌신적인 태도", "조화롭고 안정적인 관계 지향"],
        "weaknesses": ["타인의 평가에 지나치게 민감함", "갈등을 회피하고 참으려고만 함", "집착이나 구속으로 보일 수 있는 케어"],
        "advice": "타인의 평가나 주변의 시선에 흔들리지 말고 오직 두 사람만의 행복에만 집중하는 단단한 마음을 가지세요. 무조건적인 헌신이 상대에게 부담이 되거나 당신 스스로를 소모시키지 않도록, 건강한 개인의 시간과 경계를 확실히 설정하는 것이 중요합니다. 갈등을 두려워하여 속으로만 삼키다가 혼자 상처받지 말고, 건강하게 화내는 법과 자신감 있게 요청하는 법을 익혀야 합니다. 당신의 다정함이 자칫하면 상대에 대한 간섭이나 구속으로 비치지 않도록 적절한 거리를 유지하며 상대를 믿고 기다려주는 연습이 필요합니다. 남을 챙기는 에너지만큼 자신을 돌보고 성장시키는 일에도 열정을 쏟을 때 당신의 매력은 진정으로 빛을 발하게 됩니다.",
        "partner": "ISTP",
        "partnerTitle": "만능 재주꾼",
        "caution": "INTJ",
        "cautionTitle": "용의주도한 전략가",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_ESFJ.jpg"
    },
    "ENFJ": {
        "title": "성장을 지원하는 정의로운 멘토",
        "description": "타인의 행복에 진심이며, 헌신적으로 사랑하는 타입입니다.",
        "datingStyle": "당신은 연애에서도 상대방의 잠재력을 믿고 성장을 돕는 멘토 역할을 자처합니다. 매우 이타적이고 표현이 풍부하여 연인에게 끝없는 지지와 격려를 보냅니다. 하지만 온 마음을 다하는 만큼 상대방의 무관심이나 비판에 큰 상처를 받기도 하며, 관계의 이상향을 강하게 추구합니다.",
        "strengths": ["탁월한 공감력과 리더십", "열정적이고 헌신적인 태도", "품격 있고 정의로운 연애관"],
        "weaknesses": ["지나치게 상대방에게 맞추는 성향", "사소한 갈등에도 크게 상처받음", "통제하려는 것으로 보일 수 있는 헌신"],
        "advice": "상대방의 모든 문제를 당신이 해결해주려 하거나 완벽한 사람으로 변화시키려는 욕심을 내려놓으세요. 있는 그대로의 부족한 모습을 사랑해주는 것이 진정한 성장의 마중물이 된다는 사실을 잊지 말아야 합니다. 당신의 넘치는 에너지와 표현이 때로는 상대에게 보이지 않는 압박이 될 수 있으니, 가끔은 속도를 늦추고 조용히 곁을 지켜주는 것만으로도 충분합니다. 자신의 감정을 쏟아내는 것만큼이나 당신이 상처받았을 때 이를 건강하게 표현하고 위로받는 법을 배우는 것도 관계의 지속성을 위해 필수적입니다. 관계에 대한 지나친 이상주의는 현실의 작은 실망에도 크게 무너질 수 있으니, 평범하고 사소한 일상의 가치를 발견하는 연습을 하세요.",
        "partner": "INFP",
        "partnerTitle": "열정적인 중재자",
        "caution": "ISTP",
        "cautionTitle": "만능 재주꾼",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_ENFJ.jpg"
    },
    "ENTJ": {
        "title": "미래를 함께 개척할 전략가",
        "description": "에너지 넘치는 추진력으로 연애를 주도하는 리더 타입입니다.",
        "datingStyle": "연애에서도 목표 지향적이고 야심 찬 모습을 보입니다. 지적이고 능력 있는 사람에게 매력을 느끼며, 서로 시너지를 내어 발전하는 관계를 꿈꿉니다. 감정적인 변덕이나 비효율적인 싸움을 싫어하며, 문제가 생기면 즉각적이고 합리적인 해결책을 찾아 실행에 옮깁니다.",
        "strengths": ["확고한 비전과 추진력", "지적인 자극과 성취 공유", "솔직하고 뒤끝 없는 뒤처리"],
        "weaknesses": ["권위적이거나 고집스러운 면모", "감정적인 공감에 서투름", "일 중심적인 생활로 인한 소홀함"],
        "advice": "연애 관계에서 효율성과 성과를 따지는 습관을 버리고, 목적 없는 즐거움과 정서적 교감의 소중함을 느껴보세요. 당신의 추진력과 비전은 훌륭한 매력이지만, 연인이 당신의 속도를 따라오지 못할 때 다그치기보다 기다려주고 응원해주는 여유가 절대적으로 필요합니다. 감정적인 취약함을 드러내는 것을 패배라고 생각하지 말고, 오히려 신뢰를 쌓는 강력한 도구로 활용해보려는 열린 마음가짐을 가져야 합니다. 단정적인 말투와 지시하는 화법을 버리고 상대를 존중하고 의견을 묻는 질문 중심의 소통을 지향해보세요. 당신의 바쁜 일정 속에서도 연인이 최우선 순위라는 것을 느낄 수 있도록 단 10분이라도 온전히 상대에게만 몰입하는 질 높은 시간을 확보하는 것이 중요합니다.",
        "partner": "INTP",
        "partnerTitle": "논리적인 사색가",
        "caution": "ISFP",
        "cautionTitle": "호기심 많은 예술가",
        "image_url": "https://rltvlhoqbicgfjgygwuu.supabase.co/storage/v1/object/public/test_images/mbti_ENTJ.jpg"
    }
};

/**
 * Fisher-Yates shuffle algorithm to randomize an array
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function LoveMBTI() {
    const [step, setStep] = useState<'intro' | 'question' | 'result'>('intro');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, number>>({ 'E': 0, 'I': 0, 'S': 0, 'N': 0, 'T': 0, 'F': 0, 'J': 0, 'P': 0 });
    const [percentages, setPercentages] = useState<Record<string, number>>({});
    const [finalMBTI, setFinalMBTI] = useState<string>('');
    const reportRef = useRef<HTMLDivElement>(null);

    const handleStart = () => {
        // 전체 문항 중 랜덤하게 섞어서 공급 (동적 필터링을 위해 전체 풀 사용)
        setQuizQuestions(shuffleArray([...questions]));
        setStep('question');
    };

    const handleAnswer = (type: string, weight: number) => {
        setAnswers(prev => ({
            ...prev,
            [type]: prev[type] + weight
        }));
    };

    // 현재 답변 상태를 기반으로 필터링된 옵션들
    const filteredOptions = useMemo(() => {
        if (!quizQuestions[currentIndex]) return [];
        const currentOptions = quizQuestions[currentIndex].options;

        return currentOptions.filter(option => {
            const opposite = {
                'E': 'I', 'I': 'E', 'S': 'N', 'N': 'S',
                'T': 'F', 'F': 'T', 'J': 'P', 'P': 'J'
            }[option.type];

            if (!opposite) return true;

            const totalForDimension = answers[option.type] + answers[opposite];
            // 해당 차원이 10점 미만일 때만 옵션 노출
            return totalForDimension < 10;
        });
    }, [quizQuestions, currentIndex, answers]);

    useEffect(() => {
        const totalPoints = Object.values(answers).reduce((a, b) => a + b, 0);

        // 종료 조건: 모든 차원(4종)의 점수 합이 40점 이상일 때
        const isDimensionComplete = (type1: string, type2: string) => (answers[type1] + answers[type2]) >= 10;
        const allCompleted = isDimensionComplete('E', 'I') && isDimensionComplete('S', 'N') &&
            isDimensionComplete('T', 'F') && isDimensionComplete('J', 'P');

        if (allCompleted) {
            const calculatePercent = (val1: number, val2: number) => {
                const total = val1 + val2;
                return total === 0 ? 50 : Math.round((val1 / total) * 100);
            };

            const ePerc = calculatePercent(answers['E'], answers['I']);
            const sPerc = calculatePercent(answers['S'], answers['N']);
            const tPerc = calculatePercent(answers['T'], answers['F']);
            const jPerc = calculatePercent(answers['J'], answers['P']);

            setPercentages({
                'E': ePerc, 'I': 100 - ePerc,
                'S': sPerc, 'N': 100 - sPerc,
                'T': tPerc, 'F': 100 - tPerc,
                'J': jPerc, 'P': 100 - jPerc
            });

            const mbti =
                (answers['E'] >= answers['I'] ? 'E' : 'I') +
                (answers['S'] >= answers['N'] ? 'S' : 'N') +
                (answers['T'] >= answers['F'] ? 'T' : 'F') +
                (answers['J'] >= answers['P'] ? 'J' : 'P');
            setFinalMBTI(mbti);
            setStep('result');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // 현재 문항의 모든 옵션이 이미 완료된 차원이라서 필터링되었다면 다음 문항으로 자동 스킵
        if (step === 'question' && filteredOptions.length === 0 && currentIndex < quizQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    }, [answers, currentIndex, quizQuestions, step, filteredOptions]);

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
                    imageUrl: resultData.image_url || 'https://man-woman-analysis-report.vercel.app/og-mbti.png',
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
                                <li>• 매번 새로운 순서로 문항이 나타나 더욱 신선한 테스트가 가능합니다.</li>
                            </ul>
                        </div>

                        <Button
                            onClick={handleStart}
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
        const totalPoints = Object.values(answers).reduce((a, b) => a + b, 0);
        const progress = Math.min((totalPoints / 40) * 100, 100);
        const currentProgressCount = Math.min(totalPoints + 1, 40);

        const currentQuestion = quizQuestions[currentIndex];

        return (
            <div className="max-w-2xl mx-auto py-10 px-4">
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-pink-600 font-black text-2xl">{currentProgressCount} <span className="text-gray-300 text-lg font-normal">/ 40</span></span>
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
                    {currentQuestion?.text}
                </h3>

                <div className="grid grid-cols-1 gap-4">
                    {shuffleArray<{ text: string; type: string; weight: number }>(filteredOptions).map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                handleAnswer(option.type, option.weight);
                                if (currentIndex < quizQuestions.length - 1) {
                                    setCurrentIndex(currentIndex + 1);
                                }
                            }}
                            className={`w-full p-5 text-left bg-white border-2 border-gray-100 rounded-3xl hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 group relative overflow-hidden`}
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-pink-100 text-pink-600`}>
                                    {idx + 1}
                                </div>
                                <span className={`flex-1 text-gray-700 font-medium group-hover:text-pink-700 transition-colors`}>
                                    {option.text}
                                </span>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Heart className={`w-5 h-5 text-pink-300 fill-pink-300`} />
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
                <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 p-12 text-center text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                    {/* MBTI 캐릭터/상징 이미지 섹션 */}
                    <div className="relative z-10 mx-auto w-48 h-48 mb-8 rounded-[40px] overflow-hidden border-4 border-white/20 shadow-2xl bg-white flex items-center justify-center p-4 group">
                        {resultData.image_url ? (
                            <img
                                src={resultData.image_url}
                                alt={finalMBTI}
                                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="text-7xl animate-bounce-slow">✨</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    <h2 className="text-6xl font-black mb-2 relative z-10 tracking-widest drop-shadow-md">{finalMBTI}</h2>
                    <p className="text-2xl font-bold opacity-90 relative z-10 drop-shadow-sm">"{resultData.title}"</p>

                    {/* 상단 장식 */}
                    <div className="absolute top-4 right-8 text-white/20 text-8xl font-black select-none pointer-events-none">{finalMBTI.split('').join('\n')}</div>
                </div>

                <CardContent className="p-8 sm:p-12">
                    <div className="mb-10 text-center">
                        <p className="text-gray-600 leading-relaxed text-lg italic mb-10">
                            {resultData.description}
                        </p>

                        <div className="bg-white/50 backdrop-blur-sm rounded-[40px] p-8 border border-pink-100 shadow-inner mb-12">
                            <h4 className="font-bold text-gray-900 mb-8 flex items-center justify-center gap-2 text-xl">
                                <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" /> 나의 연애 성향 상세수치
                            </h4>
                            <div className="space-y-8 max-w-md mx-auto">
                                {[
                                    { left: '외향(E)', right: '내향(I)', lVal: percentages['E'], rVal: percentages['I'], color: 'from-orange-400 to-orange-500' },
                                    { left: '감각(S)', right: '직관(N)', lVal: percentages['S'], rVal: percentages['N'], color: 'from-blue-400 to-blue-500' },
                                    { left: '사고(T)', right: '감정(F)', lVal: percentages['T'], rVal: percentages['F'], color: 'from-purple-400 to-purple-500' },
                                    { left: '판단(J)', right: '인식(P)', lVal: percentages['J'], rVal: percentages['P'], color: 'from-pink-400 to-pink-500' }
                                ].map((row, i) => (
                                    <div key={i} className="relative">
                                        <div className="flex justify-between text-sm font-bold mb-2">
                                            <span className={row.lVal >= 50 ? 'text-gray-900' : 'text-gray-400'}>{row.left} {row.lVal}%</span>
                                            <span className={row.rVal >= 50 ? 'text-gray-900' : 'text-gray-400'}>{row.right} {row.rVal}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                                            <div
                                                className={`h-full bg-gradient-to-r ${row.color} transition-all duration-1000 ease-out shadow-lg`}
                                                style={{ width: `${row.lVal}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
