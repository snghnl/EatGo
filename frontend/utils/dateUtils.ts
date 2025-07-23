/**
 * 날짜 관련 유틸리티 함수들
 */

// 앱용 날짜 형식 (YY.MM.DD)
export const formatDate = (date: Date): string => {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}`;
};

// 앱용 날짜 형식 파싱 (YY.MM.DD -> Date)
export const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const [yy, mm, dd] = dateStr.split(".");
    return new Date(2000 + parseInt(yy), parseInt(mm) - 1, parseInt(dd));
};

// 웹용 날짜 형식 변환 (YYYY-MM-DD -> YY.MM.DD)
export const webToAppFormat = (webDate: string): string => {
    if (!webDate) return "";
    const [year, month, day] = webDate.split("-");
    return `${year.slice(-2)}.${month}.${day}`;
};

// 앱용 날짜 형식 변환 (YY.MM.DD -> YYYY-MM-DD)
export const appToWebFormat = (appDate: string): string => {
    if (!appDate) return "";
    const [yy, mm, dd] = appDate.split(".");
    return `20${yy}-${mm}-${dd}`;
};

// 오늘 날짜를 앱 형식으로 반환
export const getTodayFormatted = (): string => {
    return formatDate(new Date());
};

// 날짜 기반 subtitle 생성
export const getSubtitleByDate = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return "여행 일정 선택";
    
    const startMonth = parseInt(startDate.split(".")[1]);
    const endMonth = parseInt(endDate.split(".")[1]);
    
    if ((startMonth >= 6 && startMonth <= 8) || (endMonth >= 6 && endMonth <= 8)) {
        return "이열치열 여름 나기";
    } else if ((startMonth >= 3 && startMonth <= 5) || (endMonth >= 3 && endMonth <= 5)) {
        return "봄바람 휘날리는 계절";
    } else if ((startMonth >= 9 && startMonth <= 11) || (endMonth >= 9 && endMonth <= 11)) {
        return "단풍 물든 가을 여행";
    } else {
        return "눈 내리는 겨울 풍경";
    }
}; 