App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loaded: false,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("SimpleChat.json", function (schat) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.SimpleChat = TruffleContract(schat);
      // Connect provider to interact with contract
      App.contracts.SimpleChat.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },


  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.SimpleChat.deployed().then(function (instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.sendedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function () {
    loadedAccount = false;
    loaded = false;


    var chatInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: <strong>" + account + "</strong>");
      }
    });

    // Load account Info data
    App.contracts.SimpleChat.deployed().then(function (instance) 
    {
      chatInstance = instance;
      return chatInstance.accountsCount();
    
    }).then(function (accountsCount) {
      if (loadedAccount === false)
      {
        loadedAccount = true;
        var addrName = $("#accountName");
        
        var accId = $("#accountsId");
        accId.empty();

        for (var i = 1; i <= accountsCount; i++) 
        {
          chatInstance.accounts_id(i).then(function (acc) 
          {
            var addr = acc;

            chatInstance.accounts(addr).then(function (name1)
            {
              var name = name1[1];

              console.log(addr + " | " + name + " | " + accountsCount);

              accId.append("<option value='" + addr + "' >" + name + "</ option>");
    
              if (addr === App.account)
                addrName.html("Your Name <strong>" + name + "</strong>");
            }); 
          });
        }
       
    }
    return chatInstance.accounts(App.account);
    }).catch(function (error) {
      console.warn(error);
    });

    // Load contract data
    App.contracts.SimpleChat.deployed().then(function (instance) 
    {
      chatInstance = instance;
      return chatInstance.messagesCount();
    
    }).then(function (messagesCount) {
      if (loaded === false) {

        var chatRow = $("#chatRow");
        chatRow.empty();
        
        var chatTemplate = $('#chatTemplate');
        $('#noMessages').show();
        for (var i = 1; i <= messagesCount; i++) {
          chatInstance.messages(i).then(function (message) {
            var id = message[0];
            var sender = message[1];
            var receiver = message[2];
            var message = message[3];
            
            chatTemplate.find('.senderAdressId').text("Sender: " + sender);
            chatTemplate.find('.messageId').text(message);

            if (receiver === App.account){
              $('#noMessages').hide();
              chatRow.append(chatTemplate.html());
            }
              

          });
        }          
        
        loaded = true;

      }
    loader.hide();
    content.show();

    return chatInstance.messages(App.account);
    }).catch(function (error) {
      console.warn(error);
    });
  },

  sendMessage: function() {
    var receiver = $('#receiverId').val();
    var message = $('#messageId').val();

    App.contracts.SimpleChat.deployed().then(function (instance) {
      return instance.sendMessage(receiver, message, { from: App.account });
    }).then(function (result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function (err) {
      console.error(err);
    });
  },

  editAccount: function() {
    var name = $('#nameId').val();

    App.contracts.SimpleChat.deployed().then(function (instance) {
      return instance.editAccount(name, { from: App.account });
    }).then(function (result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function (err) {
      console.error(err);
    });
  },

  getAddress: function() {
    var name = $('#accountsId').val();

    var el_down = document.getElementById("receiverId"); 
    el_down.value = name;
    
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});