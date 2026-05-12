export type TransactionType =
  | 'buy'           // 买入建仓
  | 'sell'          // 卖出清仓/减仓
  | 'buy_t0'        // 做T买入
  | 'sell_t0'       // 做T卖出
  | 'dividend'      // 现金分红
  | 'reinvest'      // 红利再投资
  | 'fee'           // 申购/赎回费
  | 'dca'           // 定投买入
  | 'transfer_in'   // 转入
  | 'transfer_out'  // 转出
  | 'split'         // 拆分/合并
  | 'adjust';       // 人工调整

export interface Transaction {
  id: string;
  date: string;          // YYYY-MM-DD
  type: TransactionType;
  code: string;          // 基金/ETF/股票代码
  name: string;          // 名称
  units: number;         // 份额/股数（正数）
  price: number;         // 成交单价
  amount: number;        // 成交金额 = units * price
  fee: number;           // 手续费
  note?: string;         // 备注
  createdAt: string;     // ISO timestamp
}
