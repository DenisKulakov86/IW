export default interface HistorySales {
    date: string;
    discount: number;
    products: {
      name: string;
      count: number;
      total: number;
    }[]
  }