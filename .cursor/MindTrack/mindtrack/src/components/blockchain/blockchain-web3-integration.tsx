"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Link, 
  Link2, 
  Network, 
  Server, 
  Database, 
  Zap, 
  Activity, 
  Clock, 
  Calendar, 
  User, 
  Users, 
  Settings, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  RefreshCw, 
  Save, 
  Bell, 
  BellOff, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Lock, 
  Unlock, 
  Key, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  BookOpen, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Info, 
  HelpCircle, 
  ExternalLink, 
  LinkBreak, 
  LinkBreak2, 
  GitBranch, 
  Layers, 
  Filter, 
  Search, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Menu, 
  MoreVertical, 
  X, 
  Check, 
  Star, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Bookmark, 
  Tag, 
  Archive, 
  Folder, 
  File, 
  FilePlus, 
  FileMinus, 
  FileEdit, 
  FileSearch, 
  FileDownload, 
  FileUpload, 
  FileShare, 
  FileLock, 
  FileUnlock, 
  FileHeart, 
  FileStar, 
  FileAward, 
  FileCrown, 
  FileZap, 
  FileTarget, 
  FileShield, 
  FileSettings, 
  FileInfo, 
  FileAlert, 
  FileCheckCircle, 
  FileXCircle, 
  FilePlusCircle, 
  FileMinusCircle, 
  FileEditCircle, 
  FileSearchCircle, 
  FileDownloadCircle, 
  FileUploadCircle, 
  FileShareCircle, 
  FileLockCircle, 
  FileUnlockCircle, 
  FileHeartCircle, 
  FileStarCircle, 
  FileAwardCircle, 
  FileCrownCircle, 
  FileZapCircle, 
  FileTargetCircle, 
  FileShieldCircle, 
  FileSettingsCircle, 
  FileInfoCircle, 
  FileAlertCircle,
  Image
} from "lucide-react";

// Blockchain & Web3 Integration için gerekli interface'ler
interface BlockchainNetwork {
  id: string;
  name: string;
  type: 'ethereum' | 'polygon' | 'binance' | 'arbitrum' | 'optimism' | 'custom';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  gas: {
    price: number;
    limit: number;
    maxFeePerGas: number;
    maxPriorityFeePerGas: number;
  };
  performance: {
    blockTime: number;
    transactionsPerSecond: number;
    averageGasPrice: number;
    lastBlockNumber: number;
  };
  security: {
    consensus: string;
    validators: number;
    staking: boolean;
    slashing: boolean;
  };
  contracts: {
    deployed: number;
    verified: number;
    totalTransactions: number;
    totalVolume: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SmartContract {
  id: string;
  name: string;
  address: string;
  network: string;
  type: 'erc20' | 'erc721' | 'erc1155' | 'custom' | 'governance' | 'defi';
  status: 'active' | 'paused' | 'upgraded' | 'error';
  version: string;
  compiler: {
    version: string;
    optimization: boolean;
    runs: number;
  };
  functions: {
    name: string;
    type: 'view' | 'pure' | 'payable' | 'nonpayable';
    inputs: {
      name: string;
      type: string;
      indexed?: boolean;
    }[];
    outputs: {
      name: string;
      type: string;
    }[];
    stateMutability: string;
  }[];
  events: {
    name: string;
    inputs: {
      name: string;
      type: string;
      indexed: boolean;
    }[];
    anonymous: boolean;
  }[];
  security: {
    audited: boolean;
    verified: boolean;
    bugBounty: boolean;
    insurance: boolean;
  };
  usage: {
    totalCalls: number;
    uniqueUsers: number;
    lastInteraction: Date;
    gasUsed: number;
  };
  metadata: {
    description: string;
    website: string;
    documentation: string;
    github: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Web3Wallet {
  id: string;
  name: string;
  type: 'metamask' | 'walletconnect' | 'coinbase' | 'trust' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  address: string;
  network: string;
  balance: {
    native: number;
    tokens: number;
    nfts: number;
  };
  transactions: {
    total: number;
    pending: number;
    failed: number;
    lastTransaction: Date;
  };
  security: {
    encrypted: boolean;
    backupEnabled: boolean;
    multiSig: boolean;
    hardwareWallet: boolean;
  };
  permissions: {
    read: boolean;
    write: boolean;
    admin: boolean;
    custom: string[];
  };
  activity: {
    lastLogin: Date;
    loginCount: number;
    sessionDuration: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  network: string;
  type: 'erc721' | 'erc1155' | 'custom';
  status: 'active' | 'paused' | 'minted' | 'error';
  metadata: {
    description: string;
    image: string;
    externalUrl: string;
    attributes: Record<string, string>;
  };
  supply: {
    total: number;
    minted: number;
    burned: number;
    available: number;
  };
  pricing: {
    mintPrice: number;
    floorPrice: number;
    totalVolume: number;
    currency: string;
  };
  royalties: {
    percentage: number;
    recipient: string;
    enabled: boolean;
  };
  permissions: {
    minting: boolean;
    burning: boolean;
    transfer: boolean;
    admin: boolean;
  };
  analytics: {
    holders: number;
    transactions: number;
    averagePrice: number;
    lastSale: Date;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DeFiProtocol {
  id: string;
  name: string;
  type: 'lending' | 'dex' | 'yield' | 'derivatives' | 'insurance' | 'custom';
  status: 'active' | 'paused' | 'hacked' | 'error';
  network: string;
  contractAddress: string;
  tvl: {
    total: number;
    change24h: number;
    change7d: number;
    currency: string;
  };
  apy: {
    current: number;
    average: number;
    max: number;
  };
  volume: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  users: {
    total: number;
    active: number;
    new: number;
  };
  security: {
    audited: boolean;
    insured: boolean;
    bugBounty: boolean;
    timelock: boolean;
  };
  governance: {
    token: string;
    votingPower: number;
    proposals: number;
    quorum: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BlockchainTransaction {
  id: string;
  hash: string;
  network: string;
  status: 'pending' | 'confirmed' | 'failed' | 'dropped';
  type: 'transfer' | 'contract' | 'mint' | 'burn' | 'swap' | 'stake';
  from: string;
  to: string;
  value: number;
  gas: {
    used: number;
    limit: number;
    price: number;
    cost: number;
  };
  block: {
    number: number;
    timestamp: Date;
    confirmations: number;
  };
  contract: {
    address: string;
    method: string;
    parameters: Record<string, string>;
  };
  metadata: {
    description: string;
    tags: string[];
    category: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Blockchain & Web3 Integration Component - Blockchain ve Web3 entegrasyonu
export function BlockchainWeb3Integration() {
  // State management - Durum yönetimi
  const [blockchainNetworks, setBlockchainNetworks] = useState<BlockchainNetwork[]>([]);
  const [smartContracts, setSmartContracts] = useState<SmartContract[]>([]);
  const [web3Wallets, setWeb3Wallets] = useState<Web3Wallet[]>([]);
  const [nftCollections, setNftCollections] = useState<NFTCollection[]>([]);
  const [deFiProtocols, setDeFiProtocols] = useState<DeFiProtocol[]>([]);
  const [blockchainTransactions, setBlockchainTransactions] = useState<BlockchainTransaction[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateNetwork, setShowCreateNetwork] = useState(false);
  const [showCreateContract, setShowCreateContract] = useState(false);
  const [blockchainHealth, setBlockchainHealth] = useState(99.2);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockBlockchainNetworks: BlockchainNetwork[] = [
      {
        id: '1',
        name: 'Ethereum Mainnet',
        type: 'ethereum',
        status: 'active',
        chainId: 1,
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
        explorerUrl: 'https://etherscan.io',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        gas: {
          price: 25,
          limit: 21000,
          maxFeePerGas: 30,
          maxPriorityFeePerGas: 2
        },
        performance: {
          blockTime: 12,
          transactionsPerSecond: 15,
          averageGasPrice: 25,
          lastBlockNumber: 18500000
        },
        security: {
          consensus: 'Proof of Stake',
          validators: 1000000,
          staking: true,
          slashing: true
        },
        contracts: {
          deployed: 5000000,
          verified: 2500000,
          totalTransactions: 2000000000,
          totalVolume: 5000000000
        },
        createdBy: 'blockchain-admin@mindtrack.com',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockSmartContracts: SmartContract[] = [
      {
        id: '1',
        name: 'MindTrack Token',
        address: '0x1234567890123456789012345678901234567890',
        network: 'ethereum',
        type: 'erc20',
        status: 'active',
        version: '1.0.0',
        compiler: {
          version: '0.8.19',
          optimization: true,
          runs: 200
        },
        functions: [
          {
            name: 'transfer',
            type: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'nonpayable'
          }
        ],
        events: [
          {
            name: 'Transfer',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'to', type: 'address', indexed: true },
              { name: 'value', type: 'uint256', indexed: false }
            ],
            anonymous: false
          }
        ],
        security: {
          audited: true,
          verified: true,
          bugBounty: true,
          insurance: false
        },
        usage: {
          totalCalls: 125000,
          uniqueUsers: 50000,
          lastInteraction: new Date(Date.now() - 2 * 60 * 60 * 1000),
          gasUsed: 5000000
        },
        metadata: {
          description: 'MindTrack utility token for platform rewards',
          website: 'https://mindtrack.com/token',
          documentation: 'https://docs.mindtrack.com/token',
          github: 'https://github.com/mindtrack/token'
        },
        createdBy: 'blockchain-dev@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockWeb3Wallets: Web3Wallet[] = [
      {
        id: '1',
        name: 'MindTrack Wallet',
        type: 'metamask',
        status: 'connected',
        address: '0x9876543210987654321098765432109876543210',
        network: 'ethereum',
        balance: {
          native: 2.5,
          tokens: 15000,
          nfts: 25
        },
        transactions: {
          total: 1250,
          pending: 0,
          failed: 5,
          lastTransaction: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        security: {
          encrypted: true,
          backupEnabled: true,
          multiSig: false,
          hardwareWallet: false
        },
        permissions: {
          read: true,
          write: true,
          admin: false,
          custom: ['mint', 'stake']
        },
        activity: {
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
          loginCount: 150,
          sessionDuration: 3600
        },
        createdBy: 'user@mindtrack.com',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];

    const mockNftCollections: NFTCollection[] = [
      {
        id: '1',
        name: 'MindTrack Achievements',
        symbol: 'MTA',
        contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        network: 'ethereum',
        type: 'erc721',
        status: 'active',
        metadata: {
          description: 'Achievement NFTs for MindTrack platform users',
          image: 'https://mindtrack.com/nft/achievements.png',
          externalUrl: 'https://mindtrack.com/nft',
          attributes: {
            rarity: 'common',
            category: 'achievement',
            tier: 'bronze'
          }
        },
        supply: {
          total: 10000,
          minted: 2500,
          burned: 50,
          available: 7450
        },
        pricing: {
          mintPrice: 0.01,
          floorPrice: 0.05,
          totalVolume: 125000,
          currency: 'ETH'
        },
        royalties: {
          percentage: 5,
          recipient: '0x1234567890123456789012345678901234567890',
          enabled: true
        },
        permissions: {
          minting: true,
          burning: true,
          transfer: true,
          admin: true
        },
        analytics: {
          holders: 1800,
          transactions: 5000,
          averagePrice: 0.08,
          lastSale: new Date(Date.now() - 6 * 60 * 60 * 1000)
        },
        createdBy: 'nft-admin@mindtrack.com',
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];

    const mockDeFiProtocols: DeFiProtocol[] = [
      {
        id: '1',
        name: 'MindTrack Staking',
        type: 'yield',
        status: 'active',
        network: 'ethereum',
        contractAddress: '0x1111111111111111111111111111111111111111',
        tvl: {
          total: 2500000,
          change24h: 5.2,
          change7d: 12.8,
          currency: 'USD'
        },
        apy: {
          current: 8.5,
          average: 7.2,
          max: 12.0
        },
        volume: {
          daily: 50000,
          weekly: 350000,
          monthly: 1500000
        },
        users: {
          total: 5000,
          active: 1200,
          new: 45
        },
        security: {
          audited: true,
          insured: true,
          bugBounty: true,
          timelock: true
        },
        governance: {
          token: '0x1234567890123456789012345678901234567890',
          votingPower: 2500000,
          proposals: 15,
          quorum: 1000000
        },
        createdBy: 'defi-admin@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    const mockBlockchainTransactions: BlockchainTransaction[] = [
      {
        id: '1',
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        network: 'ethereum',
        status: 'confirmed',
        type: 'transfer',
        from: '0x9876543210987654321098765432109876543210',
        to: '0x1234567890123456789012345678901234567890',
        value: 0.1,
        gas: {
          used: 21000,
          limit: 21000,
          price: 25,
          cost: 0.000525
        },
        block: {
          number: 18500000,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          confirmations: 12
        },
        contract: {
          address: '',
          method: '',
          parameters: {}
        },
        metadata: {
          description: 'Token transfer',
          tags: ['transfer', 'token'],
          category: 'payment'
        },
        createdBy: 'user@mindtrack.com',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];

    setBlockchainNetworks(mockBlockchainNetworks);
    setSmartContracts(mockSmartContracts);
    setWeb3Wallets(mockWeb3Wallets);
    setNftCollections(mockNftCollections);
    setDeFiProtocols(mockDeFiProtocols);
    setBlockchainTransactions(mockBlockchainTransactions);
  }, []);

  // Create blockchain network - Blockchain ağı oluşturma
  const createBlockchainNetwork = useCallback(async (
    name: string,
    type: BlockchainNetwork['type']
  ) => {
    setLoading(true);
    
    try {
      // Simulated network creation - Ağ oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newNetwork: BlockchainNetwork = {
        id: `network_${Date.now()}`,
        name,
        type,
        status: 'inactive',
        chainId: 1,
        rpcUrl: '',
        explorerUrl: '',
        nativeCurrency: {
          name: 'Token',
          symbol: 'TKN',
          decimals: 18
        },
        gas: {
          price: 0,
          limit: 21000,
          maxFeePerGas: 0,
          maxPriorityFeePerGas: 0
        },
        performance: {
          blockTime: 0,
          transactionsPerSecond: 0,
          averageGasPrice: 0,
          lastBlockNumber: 0
        },
        security: {
          consensus: 'Proof of Work',
          validators: 0,
          staking: false,
          slashing: false
        },
        contracts: {
          deployed: 0,
          verified: 0,
          totalTransactions: 0,
          totalVolume: 0
        },
        createdBy: 'blockchain-admin@mindtrack.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setBlockchainNetworks(prev => [newNetwork, ...prev]);
      
      return newNetwork;
      
    } catch (error) {
      console.error('Blockchain network creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create smart contract - Akıllı kontrat oluşturma
  const createSmartContract = useCallback(async (
    name: string,
    type: SmartContract['type']
  ) => {
    setLoading(true);
    
    try {
      // Simulated contract creation - Kontrat oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newContract: SmartContract = {
        id: `contract_${Date.now()}`,
        name,
        address: '0x0000000000000000000000000000000000000000',
        network: 'ethereum',
        type,
        status: 'active',
        version: '1.0.0',
        compiler: {
          version: '0.8.19',
          optimization: false,
          runs: 200
        },
        functions: [],
        events: [],
        security: {
          audited: false,
          verified: false,
          bugBounty: false,
          insurance: false
        },
        usage: {
          totalCalls: 0,
          uniqueUsers: 0,
          lastInteraction: new Date(),
          gasUsed: 0
        },
        metadata: {
          description: '',
          website: '',
          documentation: '',
          github: ''
        },
        createdBy: 'blockchain-dev@mindtrack.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setSmartContracts(prev => [newContract, ...prev]);
      
      return newContract;
      
    } catch (error) {
      console.error('Smart contract creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate blockchain metrics - Blockchain metriklerini hesaplama
  const calculateBlockchainMetrics = useCallback(() => {
    const totalNetworks = blockchainNetworks.length;
    const activeNetworks = blockchainNetworks.filter(network => network.status === 'active').length;
    const totalContracts = smartContracts.length;
    const activeContracts = smartContracts.filter(contract => contract.status === 'active').length;
    const totalWallets = web3Wallets.length;
    const connectedWallets = web3Wallets.filter(wallet => wallet.status === 'connected').length;
    const totalCollections = nftCollections.length;
    const activeCollections = nftCollections.filter(collection => collection.status === 'active').length;
    const totalProtocols = deFiProtocols.length;
    const activeProtocols = deFiProtocols.filter(protocol => protocol.status === 'active').length;
    const totalTransactions = blockchainTransactions.length;
    const confirmedTransactions = blockchainTransactions.filter(tx => tx.status === 'confirmed').length;
    
    return {
      totalNetworks,
      activeNetworks,
      networkActivationRate: totalNetworks > 0 ? Math.round((activeNetworks / totalNetworks) * 100) : 0,
      totalContracts,
      activeContracts,
      contractActivationRate: totalContracts > 0 ? Math.round((activeContracts / totalContracts) * 100) : 0,
      totalWallets,
      connectedWallets,
      walletConnectionRate: totalWallets > 0 ? Math.round((connectedWallets / totalWallets) * 100) : 0,
      totalCollections,
      activeCollections,
      collectionActivationRate: totalCollections > 0 ? Math.round((activeCollections / totalCollections) * 100) : 0,
      totalProtocols,
      activeProtocols,
      protocolActivationRate: totalProtocols > 0 ? Math.round((activeProtocols / totalProtocols) * 100) : 0,
      totalTransactions,
      confirmedTransactions,
      transactionSuccessRate: totalTransactions > 0 ? Math.round((confirmedTransactions / totalTransactions) * 100) : 0
    };
  }, [blockchainNetworks, smartContracts, web3Wallets, nftCollections, deFiProtocols, blockchainTransactions]);

  const metrics = calculateBlockchainMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">⛓️ Blockchain & Web3 Integration</h2>
          <p className="text-gray-600">Blockchain networks and Web3 infrastructure management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Link className="h-3 w-3 mr-1" />
            {metrics.activeNetworks} Active Networks
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {blockchainHealth}% Health
          </Badge>
        </div>
      </div>

      {/* Blockchain Overview - Blockchain Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Blockchain Networks</CardTitle>
            <Network className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.activeNetworks}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalNetworks} total networks
            </p>
            <Progress value={metrics.networkActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Smart Contracts</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.activeContracts}</div>
            <p className="text-xs text-green-700">
              {metrics.totalContracts} total contracts
            </p>
            <Progress value={metrics.contractActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Web3 Wallets</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.connectedWallets}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalWallets} total wallets
            </p>
            <Progress value={metrics.walletConnectionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">NFT Collections</CardTitle>
            <Image className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.activeCollections}</div>
            <p className="text-xs text-orange-700">
              {metrics.totalCollections} total collections
            </p>
            <Progress value={metrics.collectionActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Networks - Blockchain Ağları */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Network className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">Blockchain Networks</span>
            </div>
            <Button
              onClick={() => setShowCreateNetwork(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Network
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Manage blockchain networks and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {blockchainNetworks.map((network) => (
              <div key={network.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{network.name}</div>
                    <div className="text-sm text-blue-600">{network.type} • Chain ID: {network.chainId}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={network.status === 'active' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {network.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {network.nativeCurrency.symbol}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {network.performance.transactionsPerSecond} TPS
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Performance</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Block Time: {network.performance.blockTime}s</div>
                      <div>TPS: {network.performance.transactionsPerSecond}</div>
                      <div>Gas Price: {network.performance.averageGasPrice} Gwei</div>
                      <div>Block: #{network.performance.lastBlockNumber}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Security</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Consensus: {network.security.consensus}</div>
                      <div>Validators: {network.security.validators.toLocaleString()}</div>
                      <div>Staking: {network.security.staking ? '✅' : '❌'}</div>
                      <div>Slashing: {network.security.slashing ? '✅' : '❌'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Contracts</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Deployed: {network.contracts.deployed.toLocaleString()}</div>
                      <div>Verified: {network.contracts.verified.toLocaleString()}</div>
                      <div>Transactions: {network.contracts.totalTransactions.toLocaleString()}</div>
                      <div>Volume: ${network.contracts.totalVolume.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Gas</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Price: {network.gas.price} Gwei</div>
                      <div>Limit: {network.gas.limit.toLocaleString()}</div>
                      <div>Max Fee: {network.gas.maxFeePerGas} Gwei</div>
                      <div>Priority Fee: {network.gas.maxPriorityFeePerGas} Gwei</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Contracts - Akıllı Kontratlar */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-900">Smart Contracts</span>
            </div>
            <Button
              onClick={() => setShowCreateContract(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Deploy Contract
            </Button>
          </CardTitle>
          <CardDescription className="text-green-700">
            Monitor smart contracts and their interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {smartContracts.map((contract) => (
              <div key={contract.id} className="border border-green-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-green-900">{contract.name}</div>
                    <div className="text-sm text-green-600">{contract.type} • {contract.address}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={contract.status === 'active' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                      {contract.status}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      v{contract.version}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {contract.functions.length} functions
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Security</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Audited: {contract.security.audited ? '✅' : '❌'}</div>
                      <div>Verified: {contract.security.verified ? '✅' : '❌'}</div>
                      <div>Bug Bounty: {contract.security.bugBounty ? '✅' : '❌'}</div>
                      <div>Insurance: {contract.security.insurance ? '✅' : '❌'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Usage</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Total Calls: {contract.usage.totalCalls.toLocaleString()}</div>
                      <div>Unique Users: {contract.usage.uniqueUsers.toLocaleString()}</div>
                      <div>Gas Used: {contract.usage.gasUsed.toLocaleString()}</div>
                      <div>Last Interaction: {contract.usage.lastInteraction.toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Compiler</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Version: {contract.compiler.version}</div>
                      <div>Optimization: {contract.compiler.optimization ? '✅' : '❌'}</div>
                      <div>Runs: {contract.compiler.runs}</div>
                      <div>Functions: {contract.functions.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
