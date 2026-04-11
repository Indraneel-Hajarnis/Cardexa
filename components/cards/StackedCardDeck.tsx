// ── FILE: components/cards/StackedCardDeck.tsx ────────────────────────────────

import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CreditCard } from './CreditCard';
import type { Card, Subscription } from '../../store/useStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = 192;
const STACK_OFFSET = 56; // vertical offset per card in stack

interface StackedCardDeckProps {
  cards: Card[];
  subscriptions: Subscription[];
}

export function StackedCardDeck({ cards, subscriptions }: StackedCardDeckProps): React.JSX.Element {
  const router = useRouter();

  const stackHeight = CARD_HEIGHT + (cards.length - 1) * STACK_OFFSET + 32;

  const handleCardPress = (card: Card) => {
    router.push(`/subscriptions/${card.id}`);
  };

  return (
    <View style={[styles.deckContainer, { height: stackHeight }]}>
      {/* Render in reverse order so first card is on top */}
      {[...cards].reverse().map((card, reversedIndex) => {
        const originalIndex = cards.length - 1 - reversedIndex;
        const topOffset = originalIndex * STACK_OFFSET;

        return (
          <StackedCardItem
            key={card.id}
            card={card}
            subscriptions={subscriptions}
            index={originalIndex}
            topOffset={topOffset}
            onPress={handleCardPress}
          />
        );
      })}
    </View>
  );
}

interface StackedCardItemProps {
  card: Card;
  subscriptions: Subscription[];
  index: number;
  topOffset: number;
  onPress: (card: Card) => void;
}

function StackedCardItem({
  card,
  subscriptions,
  index,
  topOffset,
  onPress,
}: StackedCardItemProps): React.JSX.Element {
  const translateY = useSharedValue(40);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = 40;
    translateY.value = withDelay(
      index * 80,
      withSpring(0, { damping: 15, stiffness: 120 })
    );
  }, [index, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSpring(1.02, { damping: 12, stiffness: 200 });
    translateY.value = withSpring(-14, { damping: 12, stiffness: 200 });

    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 120 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      onPress(card);
    }, 180);
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          top: topOffset,
          zIndex: index + 1,
        },
        animStyle,
      ]}
    >
      <Pressable onPress={handlePress} style={styles.pressable}>
        <CreditCard
          card={card}
          subscriptions={subscriptions}
          size="hero"
          flippable={false}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  deckContainer: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    position: 'relative',
  },
  cardWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  pressable: {
    width: '100%',
  },
});
