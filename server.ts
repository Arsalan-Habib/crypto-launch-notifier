import { PORT } from "./config";
import express from "express";
import { extractLinks, getContractSrcCode, getTokenAddress } from "./utils";
import { Address } from "viem";

export const initializeServer = () => {
  const app = express();

  app.get("/", (req, res) => {
    res.send("Liquipay bot is running!");
  });

  // const contractCode = `/**
  //   *Submitted for verification at Etherscan.io on 2018-08-03
  //  */

  //  pragma solidity ^0.4.24;

  //  // File: zos-lib/contracts/upgradeability/Proxy.sol

  //  /**
  //   * @title Proxy
  //   * @dev Implements delegation of calls to other contracts, with proper
  //   * forwarding of return values and bubbling of failures.
  //   * It defines a fallback function that delegates all calls to the address
  //   * returned by the abstract _implementation() internal function.
  //   */
  //  contract Proxy {
  //    /**
  //     * @dev Fallback function.
  //     * Implemented entirely in \`_fallback\`.
  //     */
  //    function () payable external {
  //      _fallback();
  //    }

  //    /**
  //     * @return The Address of the implementation.
  //     */
  //    function _implementation() internal view returns (address);

  //    /**
  //     * @dev Delegates execution to an implementation contract.
  //     * This is a low level function that doesn't return to its internal call site.
  //     * It will return to the external caller whatever the implementation returns.
  //     * @param implementation Address to delegate.
  //     */
  //    function _delegate(address implementation) internal {
  //      assembly {
  //        // Copy msg.data. We take full control of memory in this inline assembly
  //        // block because it will not return to Solidity code. We overwrite the
  //        // Solidity scratch pad at memory position 0.
  //        calldatacopy(0, 0, calldatasize)

  //        // Call the implementation.
  //        // out and outsize are 0 because we don't know the size yet.
  //        let result := delegatecall(gas, implementation, 0, calldatasize, 0, 0)

  //        // Copy the returned data.
  //        returndatacopy(0, 0, returndatasize)

  //        switch result
  //        // delegatecall returns 0 on error.
  //        case 0 { revert(0, returndatasize) }
  //        default { return(0, returndatasize) }
  //      }
  //    }

  //    /**
  //     * @dev Function that is run as the first thing in the fallback function.
  //     * Can be redefined in derived contracts to add functionality.
  //     * Redefinitions must call super._willFallback().
  //     */
  //    function _willFallback() internal {
  //    }

  //    /**
  //     * @dev fallback implementation.
  //     * Extracted to enable manual triggering.
  //     */
  //    function _fallback() internal {
  //      _willFallback();
  //      _delegate(_implementation());
  //    }
  //  }

  //  // File: openzeppelin-solidity/contracts/AddressUtils.sol

  //  /**
  //   * Utility library of inline functions on addresses
  //   */
  //  library AddressUtils {

  //    /**
  //     * Returns whether the target address is a contract
  //     * @dev This function will return false if invoked during the constructor of a contract,
  //     * as the code is not actually created until after the constructor finishes.
  //     * @param addr address to check
  //     * @return whether the target address is a contract
  //     */
  //    function isContract(address addr) internal view returns (bool) {
  //      uint256 size;
  //      // XXX Currently there is no better way to check if there is a contract in an address
  //      // than to check the size of the code at that address.
  //      // See https://ethereum.stackexchange.com/a/14016/36603
  //      // for more details about how this works.
  //      // TODO Check this again before the Serenity release, because all addresses will be
  //      // contracts then.
  //      // solium-disable-next-line security/no-inline-assembly
  //      assembly { size := extcodesize(addr) }
  //      return size > 0;
  //    }

  //  }

  //  // File: zos-lib/contracts/upgradeability/UpgradeabilityProxy.sol

  //  /**
  //   * @title UpgradeabilityProxy
  //   * @dev This contract implements a proxy that allows to change the
  //   * implementation address to which it will delegate.
  //   * Such a change is called an implementation upgrade.
  //   */
  //  contract UpgradeabilityProxy is Proxy {
  //    /**
  //     * @dev Emitted when the implementation is upgraded.
  //     * @param implementation Address of the new implementation.
  //     */
  //    event Upgraded(address implementation);

  //    /**
  //     * @dev Storage slot with the address of the current implementation.
  //     * This is the keccak-256 hash of "org.zeppelinos.proxy.implementation", and is
  //     * validated in the constructor.
  //     */
  //    bytes32 private constant IMPLEMENTATION_SLOT = 0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3;

  //    /**
  //     * @dev Contract constructor.
  //     * @param _implementation Address of the initial implementation.
  //     */
  //    constructor(address _implementation) public {
  //      assert(IMPLEMENTATION_SLOT == keccak256("org.zeppelinos.proxy.implementation"));

  //      _setImplementation(_implementation);
  //    }

  //    /**
  //     * @dev Returns the current implementation.
  //     * @return Address of the current implementation
  //     */
  //    function _implementation() internal view returns (address impl) {
  //      bytes32 slot = IMPLEMENTATION_SLOT;
  //      assembly {
  //        impl := sload(slot)
  //      }
  //    }

  //    /**
  //     * @dev Upgrades the proxy to a new implementation.
  //     * @param newImplementation Address of the new implementation.
  //     */
  //    function _upgradeTo(address newImplementation) internal {
  //      _setImplementation(newImplementation);
  //      emit Upgraded(newImplementation);
  //    }

  //    /**
  //     * @dev Sets the implementation address of the proxy.
  //     * @param newImplementation Address of the new implementation.
  //     */
  //    function _setImplementation(address newImplementation) private {
  //      require(AddressUtils.isContract(newImplementation), "Cannot set a proxy implementation to a non-contract address");

  //      bytes32 slot = IMPLEMENTATION_SLOT;

  //      assembly {
  //        sstore(slot, newImplementation)
  //      }
  //    }
  //  }

  //  // File: zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol

  //  /**
  //   * @title AdminUpgradeabilityProxy
  //   * @dev This contract combines an upgradeability proxy with an authorization
  //   * mechanism for administrative tasks.
  //   * All external functions in this contract must be guarded by the
  //   * \`ifAdmin\` modifier. See ethereum/solidity#3864 for a Solidity
  //   * feature proposal that would enable this to be done automatically.
  //   */
  //  contract AdminUpgradeabilityProxy is UpgradeabilityProxy {
  //    /**
  //     * @dev Emitted when the administration has been transferred.
  //     * @param previousAdmin Address of the previous admin.
  //     * @param newAdmin Address of the new admin.
  //     */
  //    event AdminChanged(address previousAdmin, address newAdmin);

  //    /**
  //     * @dev Storage slot with the admin of the contract.
  //     * This is the keccak-256 hash of "org.zeppelinos.proxy.admin", and is
  //     * validated in the constructor.
  //     */
  //    bytes32 private constant ADMIN_SLOT = 0x10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b;

  //    /**
  //     * @dev Modifier to check whether the \`msg.sender\` is the admin.
  //     * If it is, it will run the function. Otherwise, it will delegate the call
  //     * to the implementation.
  //     */
  //    modifier ifAdmin() {
  //      if (msg.sender == _admin()) {
  //        _;
  //      } else {
  //        _fallback();
  //      }
  //    }

  //    /**
  //     * Contract constructor.
  //     * It sets the \`msg.sender\` as the proxy administrator.
  //     * @param _implementation address of the initial implementation.
  //     */
  //    constructor(address _implementation) UpgradeabilityProxy(_implementation) public {
  //      assert(ADMIN_SLOT == keccak256("org.zeppelinos.proxy.admin"));

  //      _setAdmin(msg.sender);
  //    }

  //    /**
  //     * @return The address of the proxy admin.
  //     */
  //    function admin() external view ifAdmin returns (address) {
  //      return _admin();
  //    }

  //    /**
  //     * @return The address of the implementation.
  //     */
  //    function implementation() external view ifAdmin returns (address) {
  //      return _implementation();
  //    }

  //    /**
  //     * @dev Changes the admin of the proxy.
  //     * Only the current admin can call this function.
  //     * @param newAdmin Address to transfer proxy administration to.
  //     */
  //    function changeAdmin(address newAdmin) external ifAdmin {
  //      require(newAdmin != address(0), "Cannot change the admin of a proxy to the zero address");
  //      emit AdminChanged(_admin(), newAdmin);
  //      _setAdmin(newAdmin);
  //    }

  //    /**
  //     * @dev Upgrade the backing implementation of the proxy.
  //     * Only the admin can call this function.
  //     * @param newImplementation Address of the new implementation.
  //     */
  //    function upgradeTo(address newImplementation) external ifAdmin {
  //      _upgradeTo(newImplementation);
  //    }

  //    /**
  //     * @dev Upgrade the backing implementation of the proxy and call a function
  //     * on the new implementation.
  //     * This is useful to initialize the proxied contract.
  //     * @param newImplementation Address of the new implementation.
  //     * @param data Data to send as msg.data in the low level call.
  //     * It should include the signature and the parameters of the function to be
  //     * called, as described in
  //     * https://solidity.readthedocs.io/en/develop/abi-spec.html#function-selector-and-argument-encoding.
  //     */
  //    function upgradeToAndCall(address newImplementation, bytes data) payable external ifAdmin {
  //      _upgradeTo(newImplementation);
  //      require(address(this).call.value(msg.value)(data));
  //    }

  //    /**
  //     * @return The admin slot.
  //     */
  //    function _admin() internal view returns (address adm) {
  //      bytes32 slot = ADMIN_SLOT;
  //      assembly {
  //        adm := sload(slot)
  //      }
  //    }

  //    /**
  //     * @dev Sets the address of the proxy admin.
  //     * @param newAdmin Address of the new proxy admin.
  //     */
  //    function _setAdmin(address newAdmin) internal {
  //      bytes32 slot = ADMIN_SLOT;

  //      assembly {
  //        sstore(slot, newAdmin)
  //      }
  //    }

  //    /**
  //     * @dev Only fall back when the sender is not the admin.
  //     */
  //    function _willFallback() internal {
  //      require(msg.sender != _admin(), "Cannot call fallback function from the proxy admin");
  //      super._willFallback();
  //    }
  //  }

  //  // File: contracts/FiatTokenProxy.sol

  //  /**
  //  * Copyright CENTRE SECZ 2018
  //  *
  //  * Permission is hereby granted, free of charge, to any person obtaining a copy
  //  * of this software and associated documentation files (the "Software"), to deal
  //  * in the Software without restriction, including without limitation the rights
  //  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  //  * copies of the Software, and to permit persons to whom the Software is furnished to
  //  * do so, subject to the following conditions:
  //  *
  //  * The above copyright notice and this permission notice shall be included in all
  //  * copies or substantial portions of the Software.
  //  *
  //  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  //  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  //  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  //  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  //  * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  //  * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  //  */

  //  pragma solidity ^0.4.24;

  //  /**
  //   * @title FiatTokenProxy
  //   * @dev This contract proxies FiatToken calls and enables FiatToken upgrades
  //  */
  //  contract FiatTokenProxy is AdminUpgradeabilityProxy {
  //      constructor(address _implementation) public AdminUpgradeabilityProxy(_implementation) {
  //      }
  //  }`;

  const contractCode = `/**
        *Submitted for verification at Etherscan.io on 2024-03-07
       */

       // SPDX-License-Identifier: Unlicensed

       /*
       All essential tools for any imaginable creation, plus opportunities for share-holders to cash in on the actions!

       Web: https://aicrew.world
       App: https://ai.aicrew.world
       Tg: https://t.me/AI_Crew_ERC_official
       X: https://twitter.com/AI_Crew_X
       Docs: https://aicrew.world/pdf/AiCrew_Deck.pdf
       */

       pragma solidity 0.8.19;

       library SafeMath {
           function add(uint256 a, uint256 b) internal pure returns (uint256) {
               uint256 c = a + b;
               require(c >= a, "SafeMath: addition overflow");

               return c;
           }

           function sub(uint256 a, uint256 b) internal pure returns (uint256) {
               return sub(a, b, "SafeMath: subtraction overflow");
           }

           function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
               require(b <= a, errorMessage);
               uint256 c = a - b;

               return c;
           }

           function mul(uint256 a, uint256 b) internal pure returns (uint256) {
               if (a == 0) {
                   return 0;
               }

               uint256 c = a * b;
               require(c / a == b, "SafeMath: multiplication overflow");

               return c;
           }

           function div(uint256 a, uint256 b) internal pure returns (uint256) {
               return div(a, b, "SafeMath: division by zero");
           }

           function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
               require(b > 0, errorMessage);
               uint256 c = a / b;
               return c;
           }

           function mod(uint256 a, uint256 b) internal pure returns (uint256) {
               return mod(a, b, "SafeMath: modulo by zero");
           }

           function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
               require(b != 0, errorMessage);
               return a % b;
           }
       }

       interface IUniswapFactory {
           function getPair(address tokenA, address tokenB) external view returns (address pair);
           function allPairs(uint) external view returns (address pair);
           function allPairsLength() external view returns (uint);

           function createPair(address tokenA, address tokenB) external returns (address pair);

           function set(address) external;
           function setSetter(address) external;
       }

       interface IERC20 {
           function totalSupply() external view returns (uint256);
           function balanceOf(address account) external view returns (uint256);
           function transfer(address recipient, uint256 amount) external returns (bool);
           function allowance(address owner, address spender) external view returns (uint256);
           function approve(address spender, uint256 amount) external returns (bool);
           function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
           event Transfer(address indexed from, address indexed to, uint256 value);
           event Approval(address indexed owner, address indexed spender, uint256 value);
       }

       interface IUniswapRouter {
           function factory() external pure returns (address);
           function WETH() external pure returns (address);

           function addLiquidityETH(
               address token,
               uint amountTokenDesired,
               uint amountTokenMin,
               uint amountETHMin,
               address to,
               uint deadline
           ) external payable returns (uint amountToken, uint amountETH, uint liquidity);

           function swapExactTokensForETHSupportingFeeOnTransferTokens(
               uint amountIn,
               uint amountOutMin,
               address[] calldata path,
               address to,
               uint deadline
           ) external;
       }

       abstract contract Context {
           function _msgSender() internal view virtual returns (address payable) {
               return payable(msg.sender);
           }

           function _msgData() internal view virtual returns (bytes memory) {
               this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
               return msg.data;
           }
       }

       contract Ownable is Context {
           address private _owner;
           address private _previousOwner;

           event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

           constructor () {
               address msgSender = _msgSender();
               _owner = msgSender;
               emit OwnershipTransferred(address(0), msgSender);
           }

           function owner() public view returns (address) {
               return _owner;
           }

           modifier onlyOwner() {
               require(_owner == _msgSender(), "Ownable: caller is not the owner");
               _;
           }

           function renounceOwnership() public virtual onlyOwner {
               emit OwnershipTransferred(_owner, address(0));
               _owner = address(0);
           }

           function transferOwnership(address newOwner) public virtual onlyOwner {
               require(newOwner != address(0), "Ownable: new owner is the zero address");
               emit OwnershipTransferred(_owner, newOwner);
               _owner = newOwner;
           }
       }

       contract AICR is Context, IERC20, Ownable {
           using SafeMath for uint256;

           uint8 decimals_ = 9;
           uint256 _supply = 10**9 * 10**9;

           string name_ = unicode"AICREW";
           string symbol_ = unicode"AICR";

           IUniswapRouter private routerInstance_;
           address private pairAddress_;

           address payable _teamAddy1;
           address payable _teamAddy2;

           mapping(address => uint256) balances_;
           mapping(address => mapping(address => uint256)) allowances_;
           mapping(address => bool) _canNoTax;
           mapping(address => bool) _canHaveMaxWallet;
           mapping(address => bool) _canMaxTx;
           mapping(address => bool) _hasAddedLp;

           uint256 LiquidityFee_ = 0;
           uint256 MarketingFee_ = 24;
           uint256 DevelopmentFee_ = 0;
           uint256 TotalFee_ = 24;

           uint256 _outAICRLiquidityFee_ = 0;
           uint256 _outAICRMarketingFee_ = 24;
           uint256 _outAICRDevFee_ = 0;
           uint256 _outAICRFee_ = 24;

           uint256 _txAmountCeil = 16 * 10**6 * 10**9;
           uint256 _walletCeil = 16 * 10**6 * 10**9;
           uint256 _feeThresholSwap = 10**4 * 10**9;

           uint256 _getAICRLiquidityFee_ = 0;
           uint256 _getAICRMarketingFee_ = 24;
           uint256 _getAICRDevFee_ = 0;
           uint256 _getAICRFee_ = 24;

           bool _isProjected;
           bool _activatedTaxSwap = true;
           bool _deactivatedMaxTx = false;
           bool _deactivatedMaxWallet = true;

           modifier lockSwap() {
               _isProjected = true;
               _;
               _isProjected = false;
           }

           constructor(address address_) {
               balances_[_msgSender()] = _supply;
               IUniswapRouter _uniswapV2Router = IUniswapRouter(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
               pairAddress_ = IUniswapFactory(_uniswapV2Router.factory()).createPair(address(this), _uniswapV2Router.WETH());
               routerInstance_ = _uniswapV2Router;
               allowances_[address(this)][address(routerInstance_)] = _supply;
               _teamAddy1 = payable(address_);
               _teamAddy2 = payable(address_);
               _getAICRFee_ = _getAICRLiquidityFee_.add(_getAICRMarketingFee_).add(_getAICRDevFee_);
               _outAICRFee_ = _outAICRLiquidityFee_.add(_outAICRMarketingFee_).add(_outAICRDevFee_);
               TotalFee_ = LiquidityFee_.add(MarketingFee_).add(DevelopmentFee_);

               _canNoTax[owner()] = true;
               _canNoTax[_teamAddy1] = true;
               _canHaveMaxWallet[owner()] = true;
               _canHaveMaxWallet[pairAddress_] = true;
               _canHaveMaxWallet[address(this)] = true;
               _canMaxTx[owner()] = true;
               _canMaxTx[_teamAddy1] = true;
               _canMaxTx[address(this)] = true;
               _hasAddedLp[pairAddress_] = true;
               emit Transfer(address(0), _msgSender(), _supply);
           }

           function name() public view returns (string memory) {
               return name_;
           }

           function symbol() public view returns (string memory) {
               return symbol_;
           }

           function decimals() public view returns (uint8) {
               return decimals_;
           }

           function totalSupply() public view override returns (uint256) {
               return _supply;
           }

           function transfer(address recipient, uint256 amount) public override returns (bool) {
               _transfer(_msgSender(), recipient, amount);
               return true;
           }

           function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
               _transfer(sender, recipient, amount);
               _approve(sender, _msgSender(), allowances_[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
               return true;
           }

           function balanceOf(address account) public view override returns (uint256) {
               return balances_[account];
           }

           function _exceedChecker(address sender, address recipient, uint256 amount) internal view {
               if (!_canMaxTx[sender] && !_canMaxTx[recipient]) {
                   require(amount <= _txAmountCeil, "Transfer amount exceeds the max.");
               }
           }

           function _outAmount(address sender, address recipient, uint256 amount, uint256 toAmount) internal view returns (uint256) {
               if (!_deactivatedMaxWallet && _canNoTax[sender]) {
                   return amount.sub(toAmount);
               } else {
                   return amount;
               }
           }

           function swapBackAICR_(uint256 tokenAmount) private lockSwap {
               uint256 lpFeeTokens = tokenAmount.mul(LiquidityFee_).div(TotalFee_).div(2);
               uint256 tokensToSwap = tokenAmount.sub(lpFeeTokens);

               swapClogsToEth(tokensToSwap);
               uint256 ethCA = address(this).balance;

               uint256 totalETHFee = TotalFee_.sub(LiquidityFee_.div(2));

               uint256 amountETHLiquidity_ = ethCA.mul(LiquidityFee_).div(totalETHFee).div(2);
               uint256 amountETHDevelopment_ = ethCA.mul(DevelopmentFee_).div(totalETHFee);
               uint256 amountETHMarketing_ = ethCA.sub(amountETHLiquidity_).sub(amountETHDevelopment_);

               if (amountETHMarketing_ > 0) {
                   transferAICRETH_(_teamAddy1, amountETHMarketing_);
               }

               if (amountETHDevelopment_ > 0) {
                   transferAICRETH_(_teamAddy2, amountETHDevelopment_);
               }
           }

           function _transferN(address sender, address recipient, uint256 amount) internal {
               uint256 toAmount = _inAmount(sender, recipient, amount);
               _assertMaxWallet(recipient, toAmount);
               uint256 subAmount = _outAmount(sender, recipient, amount, toAmount);
               balances_[sender] = balances_[sender].sub(subAmount, "Balance check error");
               balances_[recipient] = balances_[recipient].add(toAmount);
               emit Transfer(sender, recipient, toAmount);
           }

           function _transferS(address sender, address recipient, uint256 amount) internal returns (bool) {
               if (_isProjected) {
                   return _transferB(sender, recipient, amount);
               } else {
                   _exceedChecker(sender, recipient, amount);
                   _isValidated(sender, recipient, amount);
                   _transferN(sender, recipient, amount);
                   return true;
               }
           }

           function _transfer(address sender, address recipient, uint256 amount) private returns (bool) {
               require(sender != address(0), "ERC20: transfer from the zero address");
               require(recipient != address(0), "ERC20: transfer to the zero address");
               return _transferS(sender, recipient, amount);
           }

           function getAICRAmount_(address sender, address receipient, uint256 amount) internal returns (uint256) {
               uint256 fee = _getFeeTokens(sender, receipient, amount);
               if (fee > 0) {
                   balances_[address(this)] = balances_[address(this)].add(fee);
                   emit Transfer(sender, address(this), fee);
               }
               return amount.sub(fee);
           }

           receive() external payable {}

           function _transferB(address sender, address recipient, uint256 amount) internal returns (bool) {
               balances_[sender] = balances_[sender].sub(amount, "Insufficient Balance");
               balances_[recipient] = balances_[recipient].add(amount);
               emit Transfer(sender, recipient, amount);
               return true;
           }

           function allowance(address owner, address spender) public view override returns (uint256) {
               return allowances_[owner][spender];
           }

           function approve(address spender, uint256 amount) public override returns (bool) {
               _approve(_msgSender(), spender, amount);
               return true;
           }

           function transferAICRETH_(address payable recipient, uint256 amount) private {
               recipient.transfer(amount);
           }

           function _getFeeTokens(address from, address to, uint256 amount) internal view returns (uint256) {
               if (_hasAddedLp[from]) {
                   return amount.mul(_getAICRFee_).div(100);
               } else if (_hasAddedLp[to]) {
                   return amount.mul(_outAICRFee_).div(100);
               }
           }

           function _isValidated(address from, address to, uint256 amount) internal {
               uint256 _feeAmount = balanceOf(address(this));
               bool minSwapable = _feeAmount >= _feeThresholSwap;
               bool isExTo = !_isProjected && _hasAddedLp[to] && _activatedTaxSwap;
               bool swapAbove = !_canNoTax[from] && amount > _feeThresholSwap;
               if (minSwapable && isExTo && swapAbove) {
                   if (_deactivatedMaxTx) {
                       _feeAmount = _feeThresholSwap;
                   }
                   swapBackAICR_(_feeAmount);
               }
           }

           function swapClogsToEth(uint256 tokenAmount) private {
               address[] memory path = new address[](2);
               path[0] = address(this);
               path[1] = routerInstance_.WETH();

               _approve(address(this), address(routerInstance_), tokenAmount);

               routerInstance_.swapExactTokensForETHSupportingFeeOnTransferTokens(
                   tokenAmount,
                   0,
                   path,
                   address(this),
                   block.timestamp
               );
           }

           function removeLimits() external onlyOwner {
               _txAmountCeil = _supply;
               _deactivatedMaxWallet = false;
               _getAICRMarketingFee_ = 1;
               _outAICRMarketingFee_ = 1;
               _getAICRFee_ = 1;
               _outAICRFee_ = 1;
           }

           function _assertMaxWallet(address to, uint256 amount) internal view {
               if (_deactivatedMaxWallet && !_canHaveMaxWallet[to]) {
                   require(balances_[to].add(amount) <= _walletCeil);
               }
           }

           function _inAmount(address sender, address recipient, uint256 amount) internal returns (uint256) {
               if (_canNoTax[sender] || _canNoTax[recipient]) {
                   return amount;
               } else {
                   return getAICRAmount_(sender, recipient, amount);
               }
           }

           function _approve(address owner, address spender, uint256 amount) private {
               require(owner != address(0), "ERC20: approve from the zero address");
               require(spender != address(0), "ERC20: approve to the zero address");

               allowances_[owner][spender] = amount;
               emit Approval(owner, spender, amount);
           }
       }`;

  app.get("/extract-links/:address", async (req, res) => {
    try {
      const address: Address = req.params.address as Address;

      const contractCode = await getContractSrcCode(address);

      //   console.log("contractCode =>", contractCode);

      if (!contractCode) {
        return res.json({
          error: "Contract not found",
        });
      }
      //   console.log(
      //     "contractCode.result[0].SourceCode =>",
      //     contractCode.result[0].SourceCode
      //   );

      const links = extractLinks(contractCode.sourceCode);

      res.json({
        links: links,
      });
    } catch (error) {
      console.log("error =>", error);
      res.json({
        error,
      });
    }
  });

  app.get("/get-tokens/:address", async (req, res) => {
    const address: Address = req.params.address as Address;

    const token = await getTokenAddress(address);

    res.json({
      success: true,
      token,
    });
  });

  app.get("/get-contract-code/:address", async (req, res) => {
    try {
      const address: Address = req.params.address as Address;

      const contractCode = await getContractSrcCode(address);

      //   console.log("contractCode =>", contractCode);

      if (!contractCode) {
        return res.json({
          error: "Contract not found",
        });
      }
      //   console.log(
      //     "contractCode.result[0].SourceCode =>",
      //     contractCode.result[0].SourceCode
      //   );

      res.json({
        contractCode,
      });
    } catch (error) {
      console.log("error =>", error);
      res.json({
        error,
      });
    }
  });

  //   listen to port 3000 by default

  app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
  });
};
