const FX_TO_IDR: Record<string, number> = {
  USD: 16_200,
  EUR: 17_500,
  SGD: 12_100,
};

export function convertToIdr(amount: number, currency: string) {
  const rate = FX_TO_IDR[currency.toUpperCase()] ?? 1;
  return Math.round(amount * rate);
}

export function formatRupiah(amountIdr: number) {
  if (amountIdr >= 1_000_000_000) {
    const billions = amountIdr / 1_000_000_000;
    const formatted = billions % 1 === 0 ? billions.toFixed(0) : billions.toFixed(1);
    return `Rp ${formatted} M`;
  }

  if (amountIdr >= 1_000_000) {
    return `Rp ${Math.round(amountIdr / 1_000_000)} Jt`;
  }

  return `Rp ${amountIdr.toLocaleString('id-ID')}`;
}

export function getProgramRewardInfo(program: {
  category: 'beasiswa' | 'kompetisi';
  funding?: string;
  prizeAmountIdr?: number;
}) {
  if (program.category === 'kompetisi') {
    if (program.prizeAmountIdr == null || program.prizeAmountIdr <= 0) {
      return null;
    }

    return {
      label: 'PRIZE',
      value: formatRupiah(program.prizeAmountIdr),
      icon: 'trophy-outline' as const,
    };
  }

  if (!program.funding) {
    return null;
  }

  return {
    label: 'DANA',
    value: program.funding,
    icon: 'wallet-outline' as const,
  };
}
