// components/onboarding/AgreementPopup.tsx
import React, { ReactNode } from 'react';
import { View, Pressable, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { ThemedText } from '@/components/ThemedText';

type Props = {
    visible: boolean;
    title: string;
    children: ReactNode;
    onClose: () => void;
    onAgree?: () => void;
};

export default function AgreementPopup({ visible, title, children, onClose, onAgree }: Props) {
    if (!visible) return null;

    return (
        <SafeAreaView style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
            {/* 반투명 배경 (탭하면 닫힘) */}
            <Pressable style={styles.backdrop} onPress={onClose} />

            {/* 가운데 카드 팝업 */}
            <View style={styles.popupContainer} pointerEvents="box-none">
                <View style={styles.card}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <ThemedText
                            style={{
                                flex: 1,
                                fontSize: Fonts.lg,
                                fontWeight: Fonts.weight.semibold as any,
                                color: Colors.textPrimary,
                            }}
                        >
                            {title}
                        </ThemedText>
                        <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
                            <ThemedText
                                style={{
                                    fontSize: Fonts.sm,
                                    color: Colors.textSecondary,
                                    fontWeight: Fonts.weight.normal as any,
                                }}
                            >
                                닫기
                            </ThemedText>
                        </Pressable>
                    </View>

                    {/* 본문(스크롤) */}
                    <ScrollView
                        style={styles.body}
                        contentContainerStyle={{ paddingBottom: 12 }}
                        showsVerticalScrollIndicator
                    >
                        {children}
                    </ScrollView>

                    {/* 풋터 버튼 */}
                    <View style={styles.footer}>
                        <Pressable style={[styles.btn, styles.subtle]} onPress={onClose}>
                            <ThemedText
                                style={{
                                    fontSize: Fonts.base,
                                    fontWeight: Fonts.weight.semibold as any,
                                    color: Colors.textPrimary,
                                }}
                            >
                                취소
                            </ThemedText>
                        </Pressable>
                        <Pressable style={[styles.btn, styles.primary]} onPress={onAgree ?? onClose}>
                            <ThemedText
                                style={{
                                    fontSize: Fonts.base,
                                    fontWeight: Fonts.weight.semibold as any,
                                    color: Colors.white,
                                }}
                            >
                                동의
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    popupContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        height: 100,
    },
    card: {
        width: '100%',
        maxWidth: 520,
        height: 500,
        bottom: 100,
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.black,
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeBtn: { paddingHorizontal: 8, paddingVertical: 6 },
    body: {
        flex: 1,
        padding: 20,
    },
    footer: {
        flexDirection: 'row',
        gap: 10,
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.border,
    },
    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtle: { backgroundColor: Colors.backgroundGray },
    primary: { backgroundColor: Colors.primary },
});
