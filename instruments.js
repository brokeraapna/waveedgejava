// ============================================================
// WaveEdge — Nifty 50 Instrument Registry
// Instrument Key format used by Upstox: NSE_EQ|{ISIN}
// Reference: https://assets.upstox.com/market-quote/instruments/exchange/NSE.csv.gz
// ============================================================

const NIFTY50 = [
  { symbol: 'RELIANCE',   name: 'Reliance Industries',    key: 'NSE_EQ|INE002A01018', sector: 'Energy' },
  { symbol: 'TCS',        name: 'Tata Consultancy Svcs',  key: 'NSE_EQ|INE467B01029', sector: 'IT' },
  { symbol: 'HDFCBANK',   name: 'HDFC Bank',              key: 'NSE_EQ|INE040A01034', sector: 'Banking' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel',          key: 'NSE_EQ|INE397D01024', sector: 'Telecom' },
  { symbol: 'ICICIBANK',  name: 'ICICI Bank',             key: 'NSE_EQ|INE090A01021', sector: 'Banking' },
  { symbol: 'INFOSYS',    name: 'Infosys',                key: 'NSE_EQ|INE009A01021', sector: 'IT' },
  { symbol: 'SBIN',       name: 'State Bank of India',    key: 'NSE_EQ|INE062A01020', sector: 'Banking' },
  { symbol: 'INFY',       name: 'Infosys Ltd',            key: 'NSE_EQ|INE009A01021', sector: 'IT' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever',     key: 'NSE_EQ|INE030A01027', sector: 'FMCG' },
  { symbol: 'ITC',        name: 'ITC Ltd',                key: 'NSE_EQ|INE154A01025', sector: 'FMCG' },
  { symbol: 'LT',         name: 'Larsen & Toubro',        key: 'NSE_EQ|INE018A01030', sector: 'Capital Goods' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance',          key: 'NSE_EQ|INE296A01024', sector: 'Finance' },
  { symbol: 'HCLTECH',    name: 'HCL Technologies',       key: 'NSE_EQ|INE860A01027', sector: 'IT' },
  { symbol: 'WIPRO',      name: 'Wipro',                  key: 'NSE_EQ|INE075A01022', sector: 'IT' },
  { symbol: 'MARUTI',     name: 'Maruti Suzuki',          key: 'NSE_EQ|INE585B01010', sector: 'Auto' },
  { symbol: 'SUNPHARMA',  name: 'Sun Pharmaceutical',     key: 'NSE_EQ|INE044A01036', sector: 'Pharma' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement',       key: 'NSE_EQ|INE481G01011', sector: 'Cement' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors',            key: 'NSE_EQ|INE155A01022', sector: 'Auto' },
  { symbol: 'TATASTEEL',  name: 'Tata Steel',             key: 'NSE_EQ|INE081A01020', sector: 'Metals' },
  { symbol: 'NTPC',       name: 'NTPC Ltd',               key: 'NSE_EQ|INE733E01010', sector: 'Power' },
  { symbol: 'POWERGRID',  name: 'Power Grid Corp',        key: 'NSE_EQ|INE752E01010', sector: 'Power' },
  { symbol: 'ONGC',       name: 'ONGC',                   key: 'NSE_EQ|INE213A01029', sector: 'Energy' },
  { symbol: 'AXISBANK',   name: 'Axis Bank',              key: 'NSE_EQ|INE238A01034', sector: 'Banking' },
  { symbol: 'NESTLEIND',  name: 'Nestle India',           key: 'NSE_EQ|INE239A01016', sector: 'FMCG' },
  { symbol: 'JSWSTEEL',   name: 'JSW Steel',              key: 'NSE_EQ|INE019A01038', sector: 'Metals' },
  { symbol: 'M&M',        name: 'Mahindra & Mahindra',    key: 'NSE_EQ|INE101A01026', sector: 'Auto' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports',            key: 'NSE_EQ|INE742F01042', sector: 'Infrastructure' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints',           key: 'NSE_EQ|INE021A01026', sector: 'Paints' },
  { symbol: 'KOTAKBANK',  name: 'Kotak Mahindra Bank',    key: 'NSE_EQ|INE237A01028', sector: 'Banking' },
  { symbol: 'TITAN',      name: 'Titan Company',          key: 'NSE_EQ|INE280A01028', sector: 'Consumer' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv',          key: 'NSE_EQ|INE918I01026', sector: 'Finance' },
  { symbol: 'TECHM',      name: 'Tech Mahindra',          key: 'NSE_EQ|INE669C01036', sector: 'IT' },
  { symbol: 'GRASIM',     name: 'Grasim Industries',      key: 'NSE_EQ|INE047A01021', sector: 'Cement' },
  { symbol: 'HDFCLIFE',   name: 'HDFC Life Insurance',    key: 'NSE_EQ|INE795G01014', sector: 'Insurance' },
  { symbol: 'BPCL',       name: 'BPCL',                   key: 'NSE_EQ|INE029A01011', sector: 'Energy' },
  { symbol: 'EICHERMOT',  name: 'Eicher Motors',          key: 'NSE_EQ|INE066A01021', sector: 'Auto' },
  { symbol: 'CIPLA',      name: 'Cipla',                  key: 'NSE_EQ|INE059A01026', sector: 'Pharma' },
  { symbol: 'DRREDDY',    name: "Dr. Reddy's Labs",       key: 'NSE_EQ|INE089A01023', sector: 'Pharma' },
  { symbol: 'DIVISLAB',   name: "Divi's Laboratories",    key: 'NSE_EQ|INE361B01024', sector: 'Pharma' },
  { symbol: 'SBILIFE',    name: 'SBI Life Insurance',     key: 'NSE_EQ|INE123W01016', sector: 'Insurance' },
  { symbol: 'COALINDIA',  name: 'Coal India',             key: 'NSE_EQ|INE522F01014', sector: 'Mining' },
  { symbol: 'BRITANNIA',  name: 'Britannia Industries',   key: 'NSE_EQ|INE216A01030', sector: 'FMCG' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp',          key: 'NSE_EQ|INE158A01026', sector: 'Auto' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank',          key: 'NSE_EQ|INE095A01012', sector: 'Banking' },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products', key: 'NSE_EQ|INE192A01025', sector: 'FMCG' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals',       key: 'NSE_EQ|INE437A01024', sector: 'Healthcare' },
  { symbol: 'HINDALCO',   name: 'Hindalco Industries',    key: 'NSE_EQ|INE038A01020', sector: 'Metals' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto',             key: 'NSE_EQ|INE917I01010', sector: 'Auto' },
  { symbol: 'SHREECEM',   name: 'Shree Cement',           key: 'NSE_EQ|INE070A01015', sector: 'Cement' },
  { symbol: 'ADANIENT',   name: 'Adani Enterprises',      key: 'NSE_EQ|INE423A01024', sector: 'Conglomerate' },
];

// Get all instrument keys as comma-separated string for batch API calls
function getAllInstrumentKeys() {
  return NIFTY50.map(i => i.key).join(',');
}

// Get instrument by symbol
function getBySymbol(symbol) {
  return NIFTY50.find(i => i.symbol === symbol);
}

// Get instrument by key
function getByKey(key) {
  return NIFTY50.find(i => i.key === key);
}

module.exports = { NIFTY50, getAllInstrumentKeys, getBySymbol, getByKey };
