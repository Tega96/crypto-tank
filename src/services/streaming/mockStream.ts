import type { MarketPoint } from "@/types/market";

const symbol = ['BTC', 'ETH', 'SOL', 'DOGE']

const prices: Record<string, number> = {
    BTC: 68000,
    ETH: 3500,
    SOL: 140,
    DOGE: 0.14,
}

function fluctuate(value: number) {
    const change = (Math.random() - 0.5) * 0.02
    return value + value * change
}

// export function generateMarketData(): MarketPoint[] {
//     return symbol.map((symbol) => {
//         prices[symbol] = fluctuate(prices[symbol])
//     })
// }