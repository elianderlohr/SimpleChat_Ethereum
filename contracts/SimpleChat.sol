pragma solidity >=0.4.21 <0.7.0;

contract SimpleChat {

    //Message class
    struct Message {
        uint id;
        address sender;
        address receiver;
        string message;
    }

    uint public messagesCount;

    mapping(uint => Message) public messages;

    event sendedEvent ();

    constructor() public {
        //sendMessage(parseAddr("0xE8d58e70fA57bCEf13a6d968A3a7915cB427e209"), "Hallo");
    }

    function sendMessage (string memory receiver, string memory message) public
    {
        messagesCount++;
        messages[messagesCount] = Message(messagesCount, msg.sender, parseAddr(receiver), message);

        emit sendedEvent();
    }

    function parseAddr(string memory _a) internal pure returns (address _parsedAddress) {
        bytes memory tmp = bytes(_a);
        uint160 iaddr = 0;
        uint160 b1;
        uint160 b2;
        for (uint i = 2; i < 2 + 2 * 20; i += 2) {
            iaddr *= 256;
            b1 = uint160(uint8(tmp[i]));
            b2 = uint160(uint8(tmp[i + 1]));
            if ((b1 >= 97) && (b1 <= 102)) {
                b1 -= 87;
            } else if ((b1 >= 65) && (b1 <= 70)) {
                b1 -= 55;
            } else if ((b1 >= 48) && (b1 <= 57)) {
                b1 -= 48;
            }
            if ((b2 >= 97) && (b2 <= 102)) {
                b2 -= 87;
            } else if ((b2 >= 65) && (b2 <= 70)) {
                b2 -= 55;
            } else if ((b2 >= 48) && (b2 <= 57)) {
                b2 -= 48;
            }
            iaddr += (b1 * 16 + b2);
        }
        return address(iaddr);
    }
}
