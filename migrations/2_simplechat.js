var SimpleChat = artifacts.require("./SimpleChat.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleChat);
};
