import React from "react";
import { View, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";

export default function ItgoPrivacyPolicy() {
  return (
    <ScrollView>
      <View>
        <ThemedText
          style={{
            fontSize: Fonts.lg,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          잇고 개인정보 처리방침
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            marginBottom: 16,
          }}
        >
          시행일자 : 2025년 9월 4일
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          1. 개인정보 처리방침 개요
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          ㈜미스트(이하 &apos;당사&apos;)는 정보통신망 이용촉진 및 정보보호 등에
          관한 법률, 개인정보보호법, 통신비밀보호법, 전기통신사업법 등
          정보통신서비스제공자가 준수하여야 할 관련 법령상의 개인정보보호 규정을
          준수하며, 관련 법령에 따른 개인정보 취급방침을 정하여 이용자의 권익을
          보호하겠습니다.{"\n\n"}
          개인정보 취급방침은 서비스 가입 단계와 홈페이지 하단에 게시하고
          있으며, 당사는 법령이나 지침 또는 서비스의 변경 사항을 반영하기 위한
          목적 등으로 개인정보 취급방침을 수정할 수 있습니다. 변경 시에는 최소
          7일 전부터 서비스 내 공지될 예정이며, 그 밖에 개인정보의 수집 및 활용,
          제3자 제공 등과 같이 이용자 권리에 대한 중요한 변경이 있으면 최소 30일
          전에 알립니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          2. 수집하는 개인정보 항목
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          수집하는 개인정보 항목은 다음과 같습니다{"\n"}• 필수 항목 : 아이디,
          닉네임, 휴대전화번호, 생년월일
          {"\n"}• 선택 항목 : 프로필 사진, 성별, 비밀번호, 위치정보{"\n"}• 자동
          생성 수집 : 단말기 정보, IP주소, 쿠키 정보, 서비스 이용 기록 등
          {"\n\n"}로그아웃 시에는 서비스에 다시 접속할 때 불편함이 없도록
          휴대전화번호를 필수적으로 요청하고 있습니다. 이벤트/프로모션
          진행과정에서 해당 서비스 이용자에 한 해 추가 개인정보 수집이 발생할 수
          있으며, 개인정보 수집 시점에서 &apos;수집하는 개인정보 항목,
          개인정보의 수집 및 이용목적, 개인정보의 보관 기간&apos;에 대해
          안내하고 동의를 받습니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          3. 제3자 제공 개인정보 항목
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          사용자 동의를 거쳐 제3자에게 제공하는 개인정보 항목은 다음과 같습니다
          {"\n"}• 제공 항목 : 장소 리뷰(글, 사진, 평가, 닉네임, 아이디 및 프로필
          사진){"\n"}• 제공 목적 : 제휴 플랫폼 상의 리뷰 노출을 통한 플랫폼
          정보의 품질 및 사용자 경험 개선{"\n"}• 제공받는 당사 : 식당 정보를
          제공하는 지도, 내비게이션 및 기타 플랫폼으로서 이곳에 명시돼 있는 당사
          {"\n"}• 보유기간 : 회원의 제공 중단 요청시, 회원 탈퇴 시, 또는 제휴
          계약 종료시까지{"\n\n"}사용자는 개인정보 제3자 제공 동의를 거부할
          권리가 있으며, 동의 거부 시 회원가입 및 회원 대상 이벤트 참여 등이
          제한될 수 있습니다. 잇고 서비스는 회원 가입을 하지 않아도 기본 서비스
          사용이 가능합니다. 개인정보 제3자 제공 동의와 상관없이 사용자는 앱 내
          설정 메뉴를 통해 개별 파트너사에 대한 리뷰 제공을 중단 요청할 수
          있으며, 요청이 접수된 이후 해당 파트너사로의 정보 제공은 중단됩니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          4. 개인정보 이용 목적
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          개인정보는 원활한 서비스 제공을 위해 활용됩니다{"\n\n"}이용자의
          개인정보는 회원 간 상호 식별, 회원이 설정한 연결수단을 통한 지인
          초대와 콘텐츠 공유, 맞춤 서비스 제공에 필수적입니다. 또한, 회원제
          서비스 이용에 따른 본인확인, 개인식별, 부정이용 및 비인가 사용방지,
          중복가입 확인, 분쟁 조정을 위한 기록보존, 고객 불만과 민원처리,
          고지사항 전달과 같이 다양한 회원 관리를 위해서도 필요합니다.{"\n\n"}이
          외에도 기능 개선, 서비스 유효성 확인, 이벤트나 광고성 정보의 제공,
          회원의 서비스 이용에 대한 통계 작성, 잘못된 이용행위의 방지 등에도
          활용될 수 있습니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          5. 개인정보 제3자 제공 원칙
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          회원의 개인정보는 절대 외부에 공개되지 않습니다{"\n\n"}당사는 이용자가
          회원가입 및 이용과정 등에서 따로 동의하는 경우나 법령에 규정된 경우를
          제외하고는 이용자의 개인정보를 목적 범위를 초과하여 이용하거나
          제3자에게 제공 또는 공유하지 않습니다.{"\n\n"}잇고에 제3자의 서비스가
          연결되어 제공되는 경우 서비스 이용을 위해 필요한 범위 내에서 이용자의
          동의를 얻은 후에 개인정보를 제3자에게 제공할 수 있습니다. 이때 정보를
          제공받는자, 이용목적, 제공항목, 보유 및 이용기간은 본 취급방침을 통해
          확인할 수 있도록 안내합니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          6. 개인정보 보유 및 파기
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          개인정보는 수집 및 이용목적이 달성되면 파기됩니다{"\n\n"}회원의
          개인정보는 원칙적으로 회원 탈퇴 시 또는 개인정보의 수집 및 이용목적이
          달성되면 파기합니다. 수집 및 이용목적이 달성된 개인정보는 별도의 DB로
          옮겨져(종이의 경우 별도의 서류함) 관계 법령에서 정한 일정 기간 보관한
          후 파기됩니다. 이때 해당하는 개인정보는 법률에 의한 경우가 아니고서는
          보유되는 이외의 목적으로 사용되지 않습니다.
          {"\n\n"}수집된 정보 파기 시, 종이에 출력된 개인정보는 분쇄기로
          분쇄하거나 소각을 통하여 파기하고 있으며 전자적 파일 형태로 저장된
          개인정보는 기록을 복구∙재생할 수 없는 기술적 방법을 사용하여
          삭제합니다.{"\n\n"}• 내부 방침에 의한 부정이용기록 : 부정 가입 및 이용
          방지를 위하여 6개월간 보관
          {"\n"}• 계약 또는 청약철회 등에 관한 기록, 대금결제 및 재화 등의
          공급에 관한 기록 : 5년{"\n"}• 소비자의 불만 또는 분쟁처리에 관한 기록
          : 3년{"\n"}• 인터넷을 통한 서비스 방문기록 : 3개월{"\n"}• 1년 이상
          서비스를 이용하지 않는 경우 : 서비스 이용에 필수적이지 않은 개인정보를
          파기하거나 별도로 분리하여 저장 관리
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          7. 개인정보 조회 및 수정 권리
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          회원은 개인정보를 조회하거나 수정할 수 있습니다{"\n\n"}등록되어 있는
          회원은 언제든지 개인정보를 조회하거나 수정할 수 있으며 수집∙이용에
          대한 동의 철회 또는 가입 해지를 요청할 수 있습니다. 동의를 거부하는
          경우, 서비스의 일부 또는 전부 이용이 어려울 수 있습니다.{"\n\n"}당사는
          이용자의 요청에 의해 해지 또는 삭제된 개인정보를 개인정보의 보유 및
          이용기간에 대해 명시된 바에 따라 처리하고 그 외의 용도로 열람 또는
          이용할 수 없도록 처리합니다.{"\n\n"}회원의 개인정보 조회와 수정은
          &apos;프로필 설정&apos;을, 가입해지(동의철회)는 &apos;서비스
          탈퇴&apos; 항목을 통하거나 개인정보관리책임자에게 서면 또는 이메일로
          요청할 수 있습니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          8. 쿠키 사용
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          당사는 서비스 제공을 위해 쿠키를 사용하기도 합니다{"\n\n"}당사는
          개인화된 서비스 제공을 위해 이용자의 정보를 저장하고 수시로 불러오는
          &apos;쿠키(cookie)를 사용합니다. 쿠키는 웹사이트를 운영하는데 이용되는
          아주 작은 파일로 사용자의 디바이스에 저장됩니다. 이용자가 본 서비스에
          방문할 경우 서버는 쿠키의 내용을 읽어 이용자의 환경에 맞춘 서비스
          제공이 가능합니다.{"\n\n"}이용자는 쿠키 설치에 대한 선택권을 가지고
          있으며, 웹 브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나,
          쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할
          수도 있습니다. 다만, 쿠키의 설치를 거부할 경우에는 로그인 등의 서비스
          이용에 어려움이 생길 수 있습니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          9. 개인정보관리 책임자
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          개인정보관리 책임자를 안내합니다{"\n\n"}당사는 회원의 개인정보를
          보호하고 개인정보와 관련된 불만을 처리하기 위하여 관련 부서 및
          개인정보 관리 책임자를 지정하고 있습니다. 서비스를 이용하면서 발생하는
          개인정보보호 관련 문의와 관련 사항은 책임자에게 연락해 주시기
          바랍니다.{"\n\n"}개인정보관리책임자
          {"\n"}• 이름 : 이승헌{"\n"}• 직위 : 대표{"\n"}• 연락처 :
          viselacity@gmail.com
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          10. 개인위치정보 처리
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          개인위치정보는 안전하게 관리됩니다. (개인 위치 정보의 처리){"\n\n"}①
          개인위치정보의 처리목적 및 보유기간{"\n"}당사는 개인위치정보를 일회성
          또는 임시로 이용 후 지체없이 파기합니다. 단, &apos;GeoTagging&apos;
          서비스와 같이 이용자가 게시물, 콘텐츠와 함께 개인위치정보를 서비스에
          게시 또는 보관하는 경우, 해당 게시물, 콘텐츠의 보관기간 동안
          개인위치정보가 함께 보관됩니다.{"\n\n"}② 서비스 제공을 위해
          개인위치정보를 처리하는 목적은 아래와 같습니다.{"\n"}• 위치정보를
          활용한 검색결과 및 콘텐츠 제공 : 정보 검색을 요청하거나
          개인위치정보주체 또는 이동성 있는 기기의 위치정보를 제공 시 본
          위치정보를 이용한 검색 결과를 제시합니다.{"\n"}• 이용자 보호 및 부정
          이용 방지: 개인위치정보주체 또는 이동성 있는 기기의 위치를 이용하여
          권한없는 자의 비정상적인 서비스 이용 시도 등을 차단합니다.{"\n"}•
          이용자 위치를 활용한 광고 등의 정보 제공: 검색결과 또는 기타 서비스
          이용 과정에서 개인위치정보주체 또는 이동성 있는 기기의 위치를 이용하여
          광고소재를 제시할 수 있습니다.{"\n"}• 길 안내 등 생활편의 서비스 제공:
          교통정보와 길 안내 등 최적의 경로를 지도로 제공하며, 주변 시설물 찾기,
          뉴스/날씨 등 생활정보, 긴급구조 서비스, 주소 자동 입력 등 다양한 경로
          및 생활 편의 서비스를 제공할 수 있습니다.{"\n"}• GeoTagging 서비스:
          게시물 또는 이용자가 저장하는 콘텐츠에 포함된 위치정보가 게시물과 함께
          저장됩니다. 저장된 위치정보는 별도의 활용없이 보관되거나, 게시물을
          작성할시 해당 위치를 편리하게 태그할 수 있도록 활용됩니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          11. 개인위치정보 수집∙이용∙제공사실 확인자료
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          ③ 개인위치정보 수집ㆍ이용ㆍ제공사실 확인자료의 보유근거 및 보유기간
          {"\n\n"}당사는 위치정보의 보호 및 이용 등에 관한 법률 제16조 제2항에
          근거하여 이용자의 위치정보 수집ㆍ이용ㆍ제공사실 확인자료를
          위치정보시스템에 자동으로 기록하며, 6개월 이상 보관합니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          12. 개인위치정보 파기
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          ④ 개인위치정보의 파기 절차 및 방법{"\n\n"}당사는 개인위치정보의
          처리목적이 달성된 경우, 개인위치정보를 재생이 불가능한 방법으로
          안전하게 파기하고 있습니다. 전자적 파일 형태는 복구 및 재생이 불가능한
          기술적인 방법으로 파기하며, 출력물 등은 분쇄하거나 소각하는 방식으로
          파기합니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          13. 개인위치정보의 제3자 제공
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          ⑤ 개인위치정보의 제3자 제공 및 통보에 관한 사항{"\n\n"}당사는 이용자의
          사전 동의 없이 개인위치정보를 제3자에게 제공하지 않으며, 이용자가
          지정한 제3자에게 개인위치정보를 제공하는 경우 매회
          개인위치정보주체에게 제공받는 자, 제공일시 및 제공목적을 즉시
          통보합니다.{"\n\n"}당사는 이용자가 외부 제휴사의 서비스를 이용하기
          위하여 개인위치정보 제공에 직접 동의한 경우, 관련 법령에 의거해 당사에
          개인위치정보 제출 의무가 발생한 경우, 이용자의 생명이나 안전에 급박한
          위험이 확인되어 이를 해소하기 위한 경우에 한하여 개인위치정보를
          제공합니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          14. 8세 이하 등의 보호의무자 권리
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          ⑥ 8세 이하 등의 보호의무자 권리·의무 및 그 행사방법{"\n\n"}당사는
          아래의 경우에 해당하는 이용자(이하 &quot;8세 이하의 아동 등&quot;이라
          함)의 보호의무자가 8세 이하의 아동 등의 생명 또는 신체보호를 위하여
          개인위치정보의 이용 또는 제공에 동의하는 경우에는 본인의 동의가 있는
          것으로 봅니다.{"\n\n"}• 8세 이하의 아동{"\n"}• 피성년후견인{"\n"}•
          장애인복지법 제2조제2항제2호의 규정에 의한 정신적 장애를 가진 자로서
          장애인고용촉진 및 직업재활법 제2조제2호의 규정에 의한 중증장애인에
          해당하는 자(장애인복지법 제32조의 규정에 의하여 장애인등록을 한 사람에
          한정){"\n\n"}8세 이하의 아동 등의 생명 또는 신체의 보호를 위하여
          개인위치정보의 이용 또는 제공에 동의를 하고자 하는 보호의무자는
          서면동의서에 보호의무자임을 증명하는 서면을 첨부하여 당사에 제출하여야
          합니다.{"\n\n"}보호의무자는 8세 이하의 아동 등의 개인위치정보 이용
          또는 제공에 동의하는 경우 개인위치정보주체 권리의 전부를 행사할 수
          있습니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          15. 위치정보 관리 책임자
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          ⑦ 위치정보 관리 책임자{"\n\n"}당사의 위치정보 관리 책임자는 위
          개인정보 보호 책임자가 겸직하고 있습니다.
        </ThemedText>

        <ThemedText
          style={{
            fontSize: Fonts.base,
            color: Colors.textPrimary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          16. 개인정보침해 신고 및 상담기관
        </ThemedText>
        <ThemedText
          style={{
            fontSize: Fonts.sm,
            color: Colors.textSecondary,
            lineHeight: 22,
            marginBottom: 20,
          }}
        >
          기타 개인정보침해에 대한 신고나 상담이 필요한 경우 아래 기관에 문의할
          수 있습니다.{"\n\n"}• 개인정보침해신고센터{"\n"} - 웹사이트:
          http://www.118.or.kr{"\n"} - 전화: 국번없이 118{"\n\n"}• 대검찰청
          사이버범죄수사단{"\n"} - 웹사이트: http://www.spo.go.kr{"\n"} - 전화:
          (02) 3480-3571
          {"\n\n"}• 개인정보침해신고센터{"\n"} - 웹사이트: http://www.ctrc.go.kr
          {"\n"} - 전화: 국번없이 1566-0112
        </ThemedText>
      </View>
    </ScrollView>
  );
}
