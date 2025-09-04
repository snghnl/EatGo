import React, { useMemo, useState } from 'react';
import {
    Modal,
    View,
    Pressable,
    StyleSheet,
    TextInput,
    Platform,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

type ReportReason =
    | '영리목적/홍보성'
    | '개인정보노출'
    | '불법정보'
    | '음란성/선정성'
    | '욕설/인신공격'
    | '아이디/DB거래'
    | '같은 내용 반복(도배)'
    | '운영규칙 위반'
    | '기타';

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    authorName: string;
    onSubmit: (payload: { authorName: string; reason: ReportReason; details: string }) => void;
}

const REASONS: ReportReason[] = [
    '영리목적/홍보성',
    '개인정보노출',
    '불법정보',
    '음란성/선정성',
    '욕설/인신공격',
    '아이디/DB거래',
    '같은 내용 반복(도배)',
    '운영규칙 위반',
    '기타',
];

export default function ReportModal({ visible, onClose, authorName, onSubmit }: ReportModalProps) {
    const [selected, setSelected] = useState<ReportReason | null>(null);
    const [details, setDetails] = useState('');

    const canSubmit = useMemo(() => !!selected, [selected]);

    const handleSubmit = () => {
        if (!selected) return;
        onSubmit({ authorName, reason: selected, details: details.trim() });
        setSelected(null);
        setDetails('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="fade" // ✅ 팝업 느낌
            transparent
            onRequestClose={onClose}
        >
            {/* 바깥 클릭 시 닫힘 */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop} />
            </TouchableWithoutFeedback>

            {/* 키보드 피해서 중앙 유지 (iOS만 padding) */}
            <KeyboardAvoidingView
                style={styles.centerWrapper}
                behavior={Platform.select({ ios: 'padding', android: undefined })}
            >
                {/* 내부 클릭은 닫히지 않도록 */}
                <TouchableWithoutFeedback>
                    <View style={styles.popupCard}>
                        {/* 제목 */}
                        <ThemedText size="xl" weight="bold">
                            게시물 신고
                        </ThemedText>
                        <ThemedText size="xs" color="textSecondary" style={styles.note}>
                            게시물 신고는 이용수칙에 맞지 않는 글을 신고하는 기능이며, 허위신고 시 제재를 받을 수
                            있습니다.
                        </ThemedText>

                        {/* 작성자 */}
                        <View style={styles.row}>
                            <ThemedText size="sm" weight="semibold">
                                작성자:
                            </ThemedText>
                            <ThemedText size="sm" color="textPrimary">
                                {authorName}
                            </ThemedText>
                        </View>

                        {/* 신고 사유 */}
                        <ThemedText size="sm" weight="semibold" style={styles.sectionTitle}>
                            신고 사유
                        </ThemedText>
                        <View style={styles.reasonGrid}>
                            {REASONS.map((r) => {
                                const checked = selected === r;
                                return (
                                    <Pressable
                                        key={r}
                                        onPress={() => setSelected(r)}
                                        style={[styles.reasonBtn, checked && styles.reasonBtnActive]}
                                    >
                                        <ThemedText
                                            size="xs"
                                            weight={checked ? 'bold' : 'normal'}
                                            color={checked ? 'primary' : 'textPrimary'}
                                        >
                                            {r}
                                        </ThemedText>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* 상세 입력 */}
                        <ThemedText size="sm" weight="semibold" style={styles.sectionTitle}>
                            상세 내용 (선택)
                        </ThemedText>
                        <TextInput
                            placeholder="신고 사유를 구체적으로 작성해주세요."
                            placeholderTextColor={Colors.textSecondary}
                            value={details}
                            onChangeText={setDetails}
                            multiline
                            style={styles.textarea}
                        />

                        {/* 액션 */}
                        <View style={styles.actions}>
                            <Pressable style={[styles.btn, styles.cancel]} onPress={onClose}>
                                <ThemedText size="sm" weight="semibold" color="textPrimary">
                                    취소
                                </ThemedText>
                            </Pressable>
                            <Pressable
                                style={[styles.btn, styles.submit, !canSubmit && styles.disabled]}
                                onPress={handleSubmit}
                                disabled={!canSubmit}
                            >
                                <ThemedText size="sm" weight="bold" color="white">
                                    신고하기
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    // ✅ 어두운 딤
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    // ✅ 중앙 정렬
    centerWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16, // 작은 화면에서 튀지 않게
    },
    // ✅ 팝업 카드
    popupCard: {
        width: '90%',
        maxWidth: 520,
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 16,
        // 그림자
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    note: { marginTop: 6 },
    row: {
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sectionTitle: { marginTop: 16 },
    reasonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    reasonBtn: {
        borderWidth: 1,
        borderColor: Colors.background,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    reasonBtnActive: {
        backgroundColor: Colors.listbackground,
        borderColor: Colors.primary,
    },
    textarea: {
        borderWidth: 1,
        borderColor: Colors.background,
        borderRadius: 12,
        padding: 10,
        minHeight: 90,
        textAlignVertical: 'top',
        marginTop: 8,
        color: Colors.textPrimary,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancel: {
        backgroundColor: Colors.backgroundGray,
    },
    submit: {
        backgroundColor: Colors.primary,
    },
    disabled: {
        opacity: 0.5,
    },
});
