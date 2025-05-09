export interface ILotteryService {
    /**
     * 同步最近开奖信息
     */
    sync(): Promise<DLTEntity | null>;
    /**
     * 同步历史开奖信息
     * @param periods 最近多少期
     */
    syncHistory(periods?: number): Promise<DLTEntity[]>;
    /**
     * 中奖结果检查
     * @param numbers 中奖号码
     * @param periods 最近多少期
     */
    check(numbers: number[], periods?: number): Promise<void>;
}

export interface DLTEntity {
    /** 期号 */
    period: string;
    /** 开奖结果 */
    result: string;
    /** 开奖时间 */
    time: Date;
    /** 详情链接 */
    url: string;
}

export interface DLTData {
    lotteryDrawNum: string;
    lotteryDrawResult: string;
    lotteryDrawTime: string;
    drawPdfUrl: string;
}
