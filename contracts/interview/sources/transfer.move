module ljs::transfer {
    use std::error;
    use std::signer;

    use aptos_framework::event;
    use aptos_framework::coin;
    use aptos_framework::timestamp;

    // There is no coin in the account
    const ENO_NOT_REGISTERED: u64 = 0;

    #[event]
    struct CoinTransfer has drop, store {
        from: address,
        to: address,
        timestamp: u64,
        amount: u64,
    }

    public entry fun transfer_coin<CoinType>(from: &signer, to: address, amount: u64) {
        let from_addr = signer::address_of(from);
        assert!(coin::is_account_registered<CoinType>(to), error::not_found(ENO_NOT_REGISTERED));
        event::emit(CoinTransfer{from: from_addr, to: to, timestamp: timestamp::now_microseconds(), amount: amount});
        coin::transfer<CoinType>(from, to, amount);
    }
}