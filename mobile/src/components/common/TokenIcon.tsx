import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { TOKEN_COLORS } from '@/utils/constants';
import { TokenSymbol } from '@/types/wallet.types';

function EthSvg({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <G>
        <Path d="M16 3L7 16.5L16 20.5L25 16.5Z" fill={color} opacity={0.55} />
        <Path d="M16 3L7 16.5L16 20.5V3Z" fill={color} />
        <Path d="M7 18.5L16 29L25 18.5L16 22.5Z" fill={color} opacity={0.55} />
        <Path d="M7 18.5L16 29V22.5Z" fill={color} />
      </G>
    </Svg>
  );
}

function SuiSvg({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path
        d="M16 3C16 3 8.5 13 8.5 18.5C8.5 22.6 11.9 26 16 26C20.1 26 23.5 22.6 23.5 18.5C23.5 13 16 3 16 3Z"
        fill={color}
      />
      <Path
        d="M16 14.5C16 14.5 12.5 18 12.5 20.5C12.5 22.4 14.1 24 16 24C17.9 24 19.5 22.4 19.5 20.5C19.5 18 16 14.5 16 14.5Z"
        fill="white"
        opacity={0.35}
      />
    </Svg>
  );
}

function SymbolSvg({ size, color, text, scale = 0.46 }: { size: number; color: string; text: string; scale?: number }) {
  const fs = size * scale;
  const mid = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <SvgText
        x={mid}
        y={mid + fs * 0.36}
        textAnchor="middle"
        fill={color}
        fontSize={fs}
        fontWeight="800"
      >
        {text}
      </SvgText>
    </Svg>
  );
}

interface Props {
  token: TokenSymbol;
  size?: number;
}

export function TokenIcon({ token, size = 44 }: Props) {
  const color = TOKEN_COLORS[token] ?? '#7C3AED';
  const inner = size * 0.72;

  const icon = () => {
    switch (token) {
      case 'ETH':  return <EthSvg size={inner} color={color} />;
      case 'SUI':  return <SuiSvg size={inner} color={color} />;
      case 'BTC':  return <SymbolSvg size={size} color={color} text="₿" scale={0.48} />;
      case 'USDT': return <SymbolSvg size={size} color={color} text="₮" scale={0.48} />;
      case 'USDC': return <SymbolSvg size={size} color={color} text="$" scale={0.52} />;
      case 'MYRC': return <SymbolSvg size={size} color={color} text="RM" scale={0.3} />;
    }
  };

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color + '1A',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {icon()}
    </View>
  );
}
