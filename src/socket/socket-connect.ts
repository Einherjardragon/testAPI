interface ISocketConnect {
    /**
     *
     * 取得report資訊
     * @param {object} [message]
     * @memberof ISocketConnect
     */
    sendInfo(message?: object): void
}

export default ISocketConnect;