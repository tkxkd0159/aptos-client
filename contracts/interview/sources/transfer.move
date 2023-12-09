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

    // Test

    #[test_only]
    use aptos_framework::account;

    #[test_only]
    struct DummyCoin {}

    #[test(from = @0x1, to = @0x2)]
    public entry fun transfer_coin_success(from: signer, to: signer) {
        let from_addr = signer::address_of(&from);
        let to_addr = signer::address_of(&to);
        account::create_account_for_test(from_addr);
        account::create_account_for_test(to_addr);
        timestamp::set_time_has_started_for_testing(&from);

        coin::create_fake_money(&from, &to, 1000000);
        transfer_coin<coin::FakeMoney>(&from, to_addr, 1000);
    }

    #[test(from = @0x1, to = @0x2)]
    #[expected_failure(abort_code = 0x60000, location = Self)]
    public entry fun transfer_coin_unregistered(from: signer, to: signer) {
        let from_addr = signer::address_of(&from);
        let to_addr = signer::address_of(&to);
        account::create_account_for_test(from_addr);
        account::create_account_for_test(to_addr);
        timestamp::set_time_has_started_for_testing(&from);

        transfer_coin<DummyCoin>(&from, to_addr, 1000);
    }
}
