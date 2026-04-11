// ── FILE: components/ui/SpendRing.tsx ────────────────────────────────────────

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
  useAnimatedProps,
} from 'react-native-reanimated';
import { fmt } from '../../lib/formatters';
import { COLORS } from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface SpendSegment {
  value: number;
  color: string;
  label: string;
}

interface SpendRingProps {
  segments: SpendSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel: string;
  centerValue: number;
}

export function SpendRing({
  segments,
  size = 240,
  strokeWidth = 24,
  centerLabel,
  centerValue,
}: SpendRingProps): React.JSX.Element {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  // Build animated props for each segment
  const segmentRotations: number[] = [];
  {
    let accum = 0;
    segments.forEach((seg) => {
      segmentRotations.push(accum * 360 - 90);
      accum += seg.value / total;
    });
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={COLORS.surfaceContainerHighest}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((seg, i) => {
          const fraction = seg.value / total;
          const segLength = circumference * fraction;
          return (
            <SpendRingSegment
              key={seg.label}
              cx={cx}
              cy={cy}
              radius={radius}
              circumference={circumference}
              strokeWidth={strokeWidth}
              segLength={segLength}
              rotation={segmentRotations[i]}
              color={seg.color}
              delay={i * 150}
            />
          );
        })}
      </Svg>
      {/* Center text */}
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: COLORS.onSurface,
            fontSize: 22,
            fontWeight: '700',
            letterSpacing: -0.5,
          }}
        >
          {fmt(Math.round(centerValue))}
        </Text>
        <Text
          style={{
            color: COLORS.onSurfaceVariant,
            fontSize: 11,
            marginTop: 2,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {centerLabel}
        </Text>
      </View>
    </View>
  );
}

interface SpendRingSegmentProps {
  cx: number;
  cy: number;
  radius: number;
  circumference: number;
  strokeWidth: number;
  segLength: number;
  rotation: number;
  color: string;
  delay: number;
}

function SpendRingSegment({
  cx,
  cy,
  radius,
  circumference,
  strokeWidth,
  segLength,
  rotation,
  color,
  delay,
}: SpendRingSegmentProps): React.JSX.Element {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [delay, opacity]);

  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
  }));

  return (
    <G rotation={rotation} origin={`${cx},${cy}`}>
      <AnimatedCircle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${segLength} ${circumference - segLength}`}
        animatedProps={animatedProps}
        strokeLinecap="butt"
      />
    </G>
  );
}
