import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '../constants/theme';

export type NdviChartPoint = {
  label: string;
  value: number;
};

type NdviLineChartProps = {
  data: NdviChartPoint[];
  minValue?: number;
  maxValue?: number;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHART_HEIGHT = 220;
const PADDING_LEFT = 42;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 24;
const DOT_RADIUS = 5;
const DOT_STROKE = 2.5;
const Y_TICK_COUNT = 5;
const Y_PADDING = 0.05;
const Y_MIN_RANGE = 0.1;

function computeYScale(
  data: NdviChartPoint[],
  minProp?: number,
  maxProp?: number,
): { yMin: number; yMax: number; yRange: number; yTicks: number[] } {
  if (minProp != null && maxProp != null) {
    const range = maxProp - minProp || Y_MIN_RANGE;
    return { yMin: minProp, yMax: maxProp, yRange: range, yTicks: buildTicks(minProp, maxProp) };
  }

  const values = data.map((d) => d.value);
  const minData = Math.min(...values);
  const maxData = Math.max(...values);

  let lo = minProp ?? Math.max(0, minData - Y_PADDING);
  let hi = maxProp ?? Math.min(1, maxData + Y_PADDING);

  if (hi - lo < Y_MIN_RANGE) {
    const mid = (lo + hi) / 2;
    lo = Math.max(0, mid - Y_MIN_RANGE / 2);
    hi = Math.min(1, lo + Y_MIN_RANGE);
    if (hi - lo < Y_MIN_RANGE) lo = Math.max(0, hi - Y_MIN_RANGE);
  }

  return { yMin: lo, yMax: hi, yRange: hi - lo, yTicks: buildTicks(lo, hi) };
}

function buildTicks(lo: number, hi: number): number[] {
  const ticks: number[] = [];
  const step = (hi - lo) / (Y_TICK_COUNT - 1);
  for (let i = 0; i < Y_TICK_COUNT; i++) {
    ticks.push(lo + step * i);
  }
  return ticks;
}

export default function NdviLineChart({
  data,
  minValue,
  maxValue,
}: NdviLineChartProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const animProgress = useRef(new Animated.Value(0)).current;
  const { yMin, yMax, yRange, yTicks } = computeYScale(data, minValue, maxValue);
  const drawWidth = containerWidth - PADDING_LEFT - PADDING_RIGHT;
  const drawHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  function handleLayout(e: LayoutChangeEvent) {
    setContainerWidth(e.nativeEvent.layout.width);
  }
  function getX(index: number): number {
    if (data.length <= 1) return PADDING_LEFT;
    return PADDING_LEFT + (index / (data.length - 1)) * drawWidth;
  }
  function getY(value: number): number {
    const clamped = Math.max(yMin, Math.min(yMax, value));
    const ratio = (clamped - yMin) / yRange;
    return PADDING_TOP + drawHeight - ratio * drawHeight;
  }
  function buildLinePath(): string {
    if (data.length === 0 || drawWidth <= 0) return '';
    return data
      .map((p, i) => {
        const x = getX(i).toFixed(2);
        const y = getY(p.value).toFixed(2);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');
  }

  function buildAreaPath(): string {
    if (data.length === 0 || drawWidth <= 0) return '';
    const baseline = PADDING_TOP + drawHeight;
    const lineSegments = data
      .map((p, i) => {
        const x = getX(i).toFixed(2);
        const y = getY(p.value).toFixed(2);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');

    const lastX = getX(data.length - 1).toFixed(2);
    const firstX = getX(0).toFixed(2);

    return `${lineSegments} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  }

  function estimatePathLength(): number {
    let len = 0;
    for (let i = 1; i < data.length; i++) {
      const dx = getX(i) - getX(i - 1);
      const dy = getY(data[i].value) - getY(data[i - 1].value);
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len || 1;
  }

  useEffect(() => {
    if (containerWidth <= 0 || data.length === 0) return;
    animProgress.setValue(0);
    Animated.timing(animProgress, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [containerWidth, data.length, animProgress]);

  const totalLength = estimatePathLength();

  const strokeDashoffset = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [totalLength, 0],
  });

  const linePath = buildLinePath();
  const areaPath = buildAreaPath();
  const ready = containerWidth > 0 && data.length > 0;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {ready && (
        <Svg width={containerWidth} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.primary} stopOpacity="0.15" />
              <Stop offset="1" stopColor={theme.primary} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          {yTicks.map((tick, idx) => {
            const y = getY(tick);
            return (
              <Line
                key={idx}
                x1={PADDING_LEFT}
                y1={y}
                x2={containerWidth - PADDING_RIGHT}
                y2={y}
                stroke={theme.border}
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.6}
              />
            );
          })}

          <Path d={areaPath} fill="url(#areaGrad)" />

          <AnimatedPath
            d={linePath}
            fill="none"
            stroke={theme.primary}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${totalLength}`}
            strokeDashoffset={strokeDashoffset}
          />

          {data.map((point, i) => (
            <Circle
              key={i}
              cx={getX(i)}
              cy={getY(point.value)}
              r={DOT_RADIUS}
              fill={theme.primary}
              stroke={theme.surface}
              strokeWidth={DOT_STROKE}
            />
          ))}
        </Svg>
      )}

      {ready &&
        yTicks.map((tick, idx) => (
          <Text
            key={idx}
            style={[
              styles.yLabel,
              {
                top: getY(tick) - 7,
                left: 0,
              },
            ]}
          >
            {tick.toFixed(2)}
          </Text>
        ))}

      {ready && (
        <View
          style={[
            styles.xAxisRow,
            {
              left: PADDING_LEFT,
              width: drawWidth,
            },
          ]}
        >
          {data.map((point, i) => {
            const xCenter = (i / (data.length - 1)) * drawWidth;
            return (
              <Text
                key={i}
                style={[
                  styles.xLabel,
                  {
                    position: 'absolute',
                    left: xCenter,
                    transform: [{ translateX: -14 }],
                  },
                ]}
              >
                {point.label}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CHART_HEIGHT + 6,
    position: 'relative',
  },
  yLabel: {
    position: 'absolute',
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '500',
    width: PADDING_LEFT - 6,
    textAlign: 'right',
  },
  xAxisRow: {
    position: 'absolute',
    bottom: 0,
    height: 20,
  },
  xLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '500',
    width: 28,
    textAlign: 'center',
  },
});
