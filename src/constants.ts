
import { Product, Client, ServiceOrder, CashMovement, GeoLocation, Category } from './types';

export const TECH_PRODUCTS: Product[] = [
  { id: '1', code: '102136773', name: 'LCD+T. S7 EDGE DORADO C/M ORIG.', category: 'PANTALLAS', price: 320.00, stock: 5, location: 'LT11-F', brand: 'SAMSUNG' },
  { id: '2', code: '102586458', name: 'BATERIA IPHONE X ORIGINAL', category: 'BATERIAS', price: 85.00, stock: 12, location: 'BAT-01', brand: 'APPLE' },
  { id: '3', code: '102256745', name: 'PIN DE CARGA TIPO C GENERICA', category: 'REPUESTOS', price: 15.00, stock: 50, location: 'CAJ-22', brand: 'GENERICO' },
  { id: '4', code: '102266765', name: 'MICA DE VIDRIO 9D REDMI NOTE 10', category: 'ACCESORIOS', price: 20.00, stock: 30, location: 'EX-01', brand: 'XIAOMI' },
];

export const TECH_CATEGORIES: Category[] = [
    { id: '1', name: 'PANTALLAS' },
    { id: '2', name: 'BATERIAS' },
    { id: '3', name: 'REPUESTOS' },
    { id: '4', name: 'ACCESORIOS' },
    { id: '5', name: 'FLEX' },
];

export const PHARMA_PRODUCTS: Product[] = [
  { id: '101', code: 'FAR-001', name: 'PARACETAMOL 500MG X 100', category: 'GENERICOS', price: 8.00, stock: 200, location: 'EST-A1', brand: 'GENFAR' },
  { id: '102', code: 'FAR-002', name: 'AMOXICILINA 500MG', category: 'ANTIBIOTICOS', price: 1.50, stock: 150, location: 'EST-B2', brand: 'PORTUGAL' },
  { id: '103', code: 'FAR-003', name: 'APRONAX 550MG (CAJA)', category: 'ANTIINFLAMATORIOS', price: 25.00, stock: 40, location: 'VIT-01', brand: 'BAYER' },
];

export const PHARMA_CATEGORIES: Category[] = [
    { id: '1', name: 'GENERICOS' },
    { id: '2', name: 'DE MARCA' },
    { id: '3', name: 'CUIDADO PERSONAL' },
    { id: '4', name: 'NUTRICION' },
    { id: '5', name: 'ANTIBIOTICOS' },
];

export const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'CLIENTE VARIOS', dni: '00000000', creditLine: 0, creditUsed: 0, totalPurchases: 1540.50, paymentScore: 3, tags: ['General'], digitalBalance: 0, department: 'CUSCO', province: 'CUSCO', district: 'CUSCO' },
  { id: '2', name: 'ALEXANDER GONZALES', dni: '73383858', phone: '933159551', email: 'alex@gmail.com', creditLine: 1000, creditUsed: 0, totalPurchases: 2450.00, paymentScore: 5, tags: ['VIP', 'Frecuente'], lastPurchaseDate: '10/12/2025', digitalBalance: 150.00, department: 'CUSCO', province: 'CUSCO', district: 'WANCHAQ', address: 'Av. La Cultura 200' }
];

export const MOCK_SERVICES: ServiceOrder[] = [
  { id: '514490', entryDate: '13/12/2025', entryTime: '10:30', exitDate: '15/12/2025', exitTime: '16:00', client: 'ALEXANDER GONZALES', deviceModel: 'IPHONE 15 PRO MAX', issue: 'Cambio de Pantalla', status: 'Entregado', technician: 'Isaac Quille', receptionist: 'Admin', cost: 830.00, color: '#10b981', usedProducts: [] }
];

// FIX: Added 'category' and 'financialType' to objects and corrected user name to match dashboard logic.
export const MOCK_CASH_MOVEMENTS: CashMovement[] = [
  { id: '1', time: '09:23:23', type: 'Ingreso', paymentMethod: 'Efectivo', concept: 'Venta con Ticket Nro. 68031', amount: 6.00, user: 'Juan Vendedor', category: 'Venta', financialType: 'Variable' },
  { id: '2', time: '09:38:28', type: 'Egreso', paymentMethod: 'Efectivo', concept: 'Nota de Credito Nro. 7589', amount: 6.00, user: 'Juan Vendedor', category: 'Devoluciones', financialType: 'Variable' },
];

const PERU_DATA = [
    { dep: "AMAZONAS", provs: ["CHACHAPOYAS", "BAGUA", "BONGARA"] },
    { dep: "CUSCO", provs: ["CUSCO", "ANTA", "CALCA", "URUBAMBA"] },
    { dep: "LIMA", provs: ["LIMA", "BARRANCA", "CAÑETE"] }
];

const GENERATED_LOCATIONS: GeoLocation[] = PERU_DATA.flatMap((d, i) => {
    const depId = `DEP-${i+1}`;
    const depObj: GeoLocation = { id: depId, name: d.dep, type: 'DEP' };
    const provObjs: GeoLocation[] = d.provs.map((p, j) => ({ id: `PROV-${i+1}-${j+1}`, name: p, type: 'PROV', parentId: depId }));
    return [depObj, ...provObjs];
});

const CUSCO_DISTRICTS: GeoLocation[] = [
    { id: 'DIST-CUS-1', name: 'CUSCO', type: 'DIST', parentId: 'PROV-2-1' },
    { id: 'DIST-CUS-8', name: 'WANCHAQ', type: 'DIST', parentId: 'PROV-2-1' },
];

export const MOCK_LOCATIONS: GeoLocation[] = [...GENERATED_LOCATIONS, ...CUSCO_DISTRICTS];
