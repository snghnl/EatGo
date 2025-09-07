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

type ReportSubjectType = 'post' | 'user';

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    subjectType: ReportSubjectType; // 'post' | 'user'
    subjectName: string;
    subjectId?: string | number;
    headerTitle?: string;
    onSubmit: (payload: {
        subjectType: ReportSubjectType;
        subjectId?: string | number;
        subjectName: string;
        reason: ReportReason;
        details: string;
    }) => void;
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

export default function ReportModal({
    visible,
    onClose,
    subjectType,
    subjectName,
    subjectId,
    headerTitle,
    onSubmit,
}: ReportModalProps) {
    const [selected, setSelected] = useState<ReportReason | null>(null);
    const [details, setDetails] = useState('');

    const canSubmit = useMemo(() => !!selected, [selected]);

    const titleText = headerTitle ?? (subjectType === 'post' ? '게시물 신고' : '사용자 신고');
    const subjectLabel = subjectType === 'post' ? '게시물' : '사용자';

    const handleSubmit = () => {
        if (!selected) return;
        onSubmit({
            subjectType,
            subjectId,
            subjectName,
            reason: selected,
            details: details.trim(),
        });
        setSelected(null);
        setDetails('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop} />
            </TouchableWithoutFeedback>
            <KeyboardAvoidingView
                style={styles.centerWrapper}
                behavior={Platform.select({ ios: 'padding', android: undefined })}
            >
                <TouchableWithoutFeedback>
                    <View style={styles.popupCard}>
                        <ThemedText size="xl" weight="bold">
                            {titleText}
                        </ThemedText>
                        <ThemedText size="xs" color="textSecondary" style={styles.note}>
                            신고는 이용수칙 위반 콘텐츠/사용자를 제보하는 기능입니다. 허위 신고 시 제재될 수 있습니다.
                        </ThemedText>

                        <View style={styles.row}>
                            <ThemedText size="sm" weight="semibold">
                                {subjectLabel}:
                            </ThemedText>
                            <ThemedText size="sm" color="textPrimary">
                                {subjectName}
                            </ThemedText>
                        </View>

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
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
    centerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    popupCard: {
        width: '90%',
        maxWidth: 520,
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    note: { marginTop: 6 },
    row: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
    sectionTitle: { marginTop: 16 },
    reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    reasonBtn: {
        borderWidth: 1,
        borderColor: Colors.background,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    reasonBtnActive: { backgroundColor: Colors.listbackground, borderColor: Colors.primary },
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
    actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
    btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    cancel: { backgroundColor: Colors.backgroundGray },
    submit: { backgroundColor: Colors.primary },
    disabled: { opacity: 0.5 },
});
