import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// -----------------------------------------------------------------------------
// 1. WORK ORDERS MODULE
// -----------------------------------------------------------------------------
export function WorkOrdersView({ onBack }: { onBack: () => void }) {
  const [orders, setOrders] = useState([
    { id: 'WO-2026-0101', title: 'HVAC Air Filter Replacement & Coil Clean', type: 'Reactive', priority: 'High', location: 'Building 1 · Floor 2 · AHU-04', status: 'In Progress', assigned: 'Ramesh K.', hours: '2.5 hrs' },
    { id: 'WO-2026-0102', title: 'Fire Exit Door Magnetic Latch Adjustment', type: 'Corrective', priority: 'Medium', location: 'Building 2 · Floor 1 · Exit North', status: 'Open', assigned: 'Sunil M.', hours: '1.0 hr' },
    { id: 'WO-2026-0103', title: 'Primary Chilled Water Pump Vibration Test', type: 'Predictive', priority: 'Low', location: 'Plant Room B2 · Pump WP-02', status: 'Completed', assigned: 'Dinesh P.', hours: '3.0 hrs' },
    { id: 'WO-2026-0104', title: 'Backup Generator Fuel Line Inspection', type: 'Predictive', priority: 'Medium', location: 'Basement 1 · Genset 01', status: 'In Progress', assigned: 'Ramesh K.', hours: '1.5 hrs' },
  ]);

  function toggleComplete(id: string) {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status: o.status === 'Completed' ? 'In Progress' : 'Completed' } : o))
    );
  }

  return (
    <View style={styles.subContainer}>
      <View style={styles.topNav}>
        <Pressable onPress={onBack} hitSlop={10}><Text style={styles.backBtnText}>← Dashboard</Text></Pressable>
        <Text style={styles.navCategory}>MAINTENANCE CONTROL</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <Text style={styles.screenHeading}>Work Orders</Text>
        <Text style={styles.screenSub}>Execute reactive, corrective, and predictive maintenance schedules.</Text>

        <View style={styles.actionBanner}>
          <Text style={styles.bannerBold}>{orders.filter(o => o.status !== 'Completed').length} Active Orders</Text>
          <Text style={styles.bannerSmall}>Tap any card to toggle between In Progress and Completed.</Text>
        </View>

        <View style={styles.cardList}>
          {orders.map(order => {
            const isDone = order.status === 'Completed';
            return (
              <Pressable
                key={order.id}
                onPress={() => toggleComplete(order.id)}
                style={({ pressed }) => [styles.itemCard, isDone && styles.itemCardDone, pressed && { opacity: 0.85 }]}
              >
                <View style={styles.rowBetween}>
                  <Text style={[styles.tagCode, isDone && { color: '#059669' }]}>{order.id} · {order.type}</Text>
                  <View style={[styles.statusChip, isDone ? styles.chipDone : styles.chipActive]}>
                    <Text style={[styles.statusChipText, isDone && { color: '#059669' }]}>{order.status}</Text>
                  </View>
                </View>
                <Text style={[styles.cardHead, isDone && styles.cardHeadDone]}>{order.title}</Text>
                <Text style={styles.cardMeta}>📍 {order.location}</Text>
                <View style={styles.divider} />
                <View style={styles.rowBetween}>
                  <Text style={styles.metaSub}>Assigned: <Text style={{ fontWeight: '700' }}>{order.assigned}</Text></Text>
                  <Text style={styles.togglePrompt}>{isDone ? '↺ Re-open' : '✓ Mark Complete'}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------------------------------
// 2. SPACES & ASSETS MODULE
// -----------------------------------------------------------------------------
export function AssetsView({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState('');
  const [scannedAsset, setScannedAsset] = useState<string | null>(null);

  const assets = [
    { id: 'AST-HVAC-010', name: 'Carrier Central Chiller Unit 01', category: 'HVAC', location: 'Building 1 · Rooftop', status: 'Operational', lastService: '12 Jan 2026', nextService: '12 Apr 2026' },
    { id: 'AST-ELEC-004', name: 'Schneider 400kVA Main Distribution Panel', category: 'Electrical', location: 'Building 1 · Basement Electrical Room', status: 'Operational', lastService: '02 Feb 2026', nextService: '02 Aug 2026' },
    { id: 'AST-PLMB-022', name: 'Grundfos Hydro Multi-E Booster Pump', category: 'Plumbing', location: 'Building 2 · Basement Pump Room', status: 'Needs Service', lastService: '18 Nov 2025', nextService: 'Overdue' },
    { id: 'AST-ELEV-002', name: 'Otis Gen2 Passenger Elevator #2', category: 'Conveyance', location: 'HQ Tower · Shaft B', status: 'Operational', lastService: '28 Jan 2026', nextService: '28 Feb 2026' },
  ];

  const filtered = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase()));

  function simulateScan() {
    Alert.alert(
      'Simulate Asset QR Scan',
      'Scanning QR code on Carrier Central Chiller Unit 01...',
      [{ text: 'View Asset Profile', onPress: () => setScannedAsset('AST-HVAC-010') }]
    );
  }

  return (
    <View style={styles.subContainer}>
      <View style={styles.topNav}>
        <Pressable onPress={onBack} hitSlop={10}><Text style={styles.backBtnText}>← Dashboard</Text></Pressable>
        <Text style={styles.navCategory}>PROPERTY & INFRASTRUCTURE</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.screenHeading}>Spaces & Assets</Text>
            <Text style={styles.screenSub}>Browse 248 facility assets across 3 buildings.</Text>
          </View>
          <Pressable onPress={simulateScan} style={styles.scanBtn}>
            <Text style={styles.scanBtnText}>📷 Scan QR</Text>
          </Pressable>
        </View>

        <TextInput
          placeholder="Search by asset name, category, or floor..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          style={styles.searchBar}
        />

        {scannedAsset && (
          <View style={styles.scanBanner}>
            <View style={styles.rowBetween}>
              <Text style={styles.scanBannerTitle}>✓ QR Verified: AST-HVAC-010</Text>
              <Pressable onPress={() => setScannedAsset(null)}><Text style={{ color: '#0F766E', fontWeight: '800' }}>Dismiss</Text></Pressable>
            </View>
            <Text style={styles.scanBannerText}>Warranty valid through Dec 2028. All 4 compressor logs optimal.</Text>
          </View>
        )}

        <View style={styles.cardList}>
          {filtered.map(asset => (
            <View key={asset.id} style={styles.itemCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.tagCode}>{asset.id} · {asset.category}</Text>
                <Text style={[styles.statusTag, asset.status === 'Operational' ? styles.statusGreen : styles.statusAmber]}>
                  {asset.status}
                </Text>
              </View>
              <Text style={styles.cardHead}>{asset.name}</Text>
              <Text style={styles.cardMeta}>📍 {asset.location}</Text>
              <View style={styles.divider} />
              <View style={styles.rowBetween}>
                <Text style={styles.metaSub}>Last Service: {asset.lastService}</Text>
                <Text style={[styles.metaSub, asset.nextService === 'Overdue' && { color: '#DC2626', fontWeight: '800' }]}>
                  Next: {asset.nextService}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------------------------------
// 3. INSPECTIONS MODULE
// -----------------------------------------------------------------------------
export function InspectionsView({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState([
    { id: '1', title: 'HVAC Cooling & Thermostat Calibration', desc: 'Verify air temperature output is between 20°C - 22°C', status: 'pass' },
    { id: '2', title: 'Plumbing Supply & Drain Traps', desc: 'Inspect for water pooling, seal deterioration, or pipe leaks', status: 'pass' },
    { id: '3', title: 'Electrical Outlet & Breaker Trips', desc: 'GFCI socket continuity and circuit panel label integrity', status: 'pending' },
    { id: '4', title: 'Emergency Exit Lighting & Smoke Sensors', desc: 'Battery backup test and optical smoke chamber check', status: 'pass' },
    { id: '5', title: 'Interior Paint, Flooring & Ceilings', desc: 'Water stain inspection and acoustic ceiling tile seating', status: 'pending' },
  ]);

  function toggleItem(id: string) {
    setItems(prev =>
      prev.map(it => (it.id === id ? { ...it, status: it.status === 'pass' ? 'pending' : 'pass' } : it))
    );
  }

  function handleSignOff() {
    Alert.alert(
      'Inspection Sign-off Completed!',
      'Checklist recorded into audit history. Supervisor digital signature attached.',
      [{ text: 'Done' }]
    );
  }

  const passedCount = items.filter(i => i.status === 'pass').length;

  return (
    <View style={styles.subContainer}>
      <View style={styles.topNav}>
        <Pressable onPress={onBack} hitSlop={10}><Text style={styles.backBtnText}>← Dashboard</Text></Pressable>
        <Text style={styles.navCategory}>TENANCY COMPLIANCE</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <Text style={styles.screenHeading}>Move-in / Move-out Audit</Text>
        <Text style={styles.screenSub}>Building 1 · Unit 201 · Pre-occupancy Handover Inspection</Text>

        <View style={styles.progressBarWrapper}>
          <View style={styles.rowBetween}>
            <Text style={styles.progressText}>Audit Progress: {passedCount} of {items.length} completed</Text>
            <Text style={{ fontWeight: '800', color: '#0F766E' }}>{Math.round((passedCount / items.length) * 100)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(passedCount / items.length) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.cardList}>
          {items.map(item => {
            const isPass = item.status === 'pass';
            return (
              <Pressable
                key={item.id}
                onPress={() => toggleItem(item.id)}
                style={({ pressed }) => [styles.itemCard, pressed && { opacity: 0.85 }]}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.cardHead}>{item.title}</Text>
                  <View style={[styles.checkBubble, isPass && styles.checkBubblePass]}>
                    <Text style={[styles.checkBubbleText, isPass && { color: '#FFFFFF' }]}>
                      {isPass ? '✓ PASS' : 'PENDING'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={handleSignOff} style={styles.primaryActionButton}>
          <Text style={styles.primaryActionText}>Sign & Complete Audit ↗</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------------------------------
// 4. INVENTORY MODULE
// -----------------------------------------------------------------------------
export function InventoryView({ onBack }: { onBack: () => void }) {
  const [stock, setStock] = useState([
    { id: 'SKU-001', name: 'MERV 13 Air Filter (24x24x2)', category: 'HVAC', count: 18, min: 10, unit: 'pcs' },
    { id: 'SKU-002', name: '1.5 HP Centrifugal Pump Motor', category: 'Plumbing', count: 2, min: 3, unit: 'units' },
    { id: 'SKU-003', name: 'LED Modular Ceiling Panel 40W', category: 'Electrical', count: 34, min: 15, unit: 'pcs' },
    { id: 'SKU-004', name: 'Ball Valve 1.5-inch Brass', category: 'Plumbing', count: 8, min: 8, unit: 'pcs' },
  ]);

  function requestRestock(id: string) {
    setStock(prev =>
      prev.map(s => (s.id === id ? { ...s, count: s.count + 5 } : s))
    );
    Alert.alert('Stock Reorder Submitted', '+5 units requested from authorized vendor catalogue.');
  }

  return (
    <View style={styles.subContainer}>
      <View style={styles.topNav}>
        <Pressable onPress={onBack} hitSlop={10}><Text style={styles.backBtnText}>← Dashboard</Text></Pressable>
        <Text style={styles.navCategory}>MATERIALS & STOCK</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <Text style={styles.screenHeading}>Inventory Control</Text>
        <Text style={styles.screenSub}>Review spare parts, reorder thresholds, and material requests.</Text>

        <View style={styles.cardList}>
          {stock.map(item => {
            const isLow = item.count <= item.min;
            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.tagCode}>{item.id} · {item.category}</Text>
                  <Text style={[styles.statusTag, isLow ? styles.statusAmber : styles.statusGreen]}>
                    {isLow ? 'Low Stock' : 'In Stock'}
                  </Text>
                </View>
                <Text style={styles.cardHead}>{item.name}</Text>
                <Text style={styles.cardMeta}>Quantity available: <Text style={{ fontWeight: '800', color: '#0F172A' }}>{item.count} {item.unit}</Text> (Safety min: {item.min})</Text>
                <View style={styles.divider} />
                <View style={styles.rowBetween}>
                  <Text style={styles.metaSub}>Vendor SLA: 2 business days</Text>
                  <Pressable onPress={() => requestRestock(item.id)} style={styles.smallActionBtn}>
                    <Text style={styles.smallActionBtnText}>+ Reorder 5 Units</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------------------------------
// 5. REPORTS MODULE
// -----------------------------------------------------------------------------
export function ReportsView({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState<'30D' | '90D' | 'YTD'>('30D');

  return (
    <View style={styles.subContainer}>
      <View style={styles.topNav}>
        <Pressable onPress={onBack} hitSlop={10}><Text style={styles.backBtnText}>← Dashboard</Text></Pressable>
        <Text style={styles.navCategory}>EXECUTIVE ANALYTICS</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <View style={styles.rowBetween}>
          <Text style={styles.screenHeading}>Operations Reports</Text>
          <View style={styles.periodRow}>
            {(['30D', '90D', 'YTD'] as const).map(p => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              >
                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={styles.screenSub}>Performance KPIs, SLA compliance rates, and maintenance spend.</Text>

        <View style={styles.statsGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>94.2%</Text>
            <Text style={styles.kpiLabel}>SLA Compliance</Text>
            <Text style={styles.kpiDelta}>↗ +2.1% vs last period</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>₹42,800</Text>
            <Text style={styles.kpiLabel}>Maintenance Spend</Text>
            <Text style={styles.kpiDelta}>↘ -8.4% cost savings</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>1.8 hrs</Text>
            <Text style={styles.kpiLabel}>Avg Resolution Time</Text>
            <Text style={styles.kpiDelta}>Target: &lt; 4.0 hrs</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>03</Text>
            <Text style={styles.kpiLabel}>Repeat Asset Failures</Text>
            <Text style={[styles.kpiDelta, { color: '#059669' }]}>Carrier Chiller Unit 01</Text>
          </View>
        </View>

        <View style={styles.itemCard}>
          <Text style={styles.cardHead}>Top Maintenance Categories ({period})</Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            <View>
              <View style={styles.rowBetween}><Text style={styles.categoryName}>HVAC & Climate Control</Text><Text style={styles.categoryPct}>44% (16 cases)</Text></View>
              <View style={styles.catBarTrack}><View style={[styles.catBarFill, { width: '44%', backgroundColor: '#0EA5E9' }]} /></View>
            </View>
            <View>
              <View style={styles.rowBetween}><Text style={styles.categoryName}>Plumbing & Drainage</Text><Text style={styles.categoryPct}>28% (10 cases)</Text></View>
              <View style={styles.catBarTrack}><View style={[styles.catBarFill, { width: '28%', backgroundColor: '#0F766E' }]} /></View>
            </View>
            <View>
              <View style={styles.rowBetween}><Text style={styles.categoryName}>Electrical & Power</Text><Text style={styles.categoryPct}>18% (6 cases)</Text></View>
              <View style={styles.catBarTrack}><View style={[styles.catBarFill, { width: '18%', backgroundColor: '#F59E0B' }]} /></View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  subContainer: { flex: 1, backgroundColor: '#F8FAF9' },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtnText: { color: '#0F766E', fontSize: 13, fontWeight: '700' },
  navCategory: { fontSize: 9, letterSpacing: 1.5, fontWeight: '800', color: '#64748B' },
  scrollPad: { padding: 20, paddingBottom: 60, maxWidth: 700, width: '100%', alignSelf: 'center' },
  screenHeading: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  screenSub: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 19 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionBanner: {
    backgroundColor: '#E6FFFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    padding: 14,
    borderRadius: 14,
    marginTop: 18,
    marginBottom: 16,
  },
  bannerBold: { fontSize: 14, fontWeight: '800', color: '#0F766E' },
  bannerSmall: { fontSize: 11, color: '#115E59', marginTop: 3 },
  cardList: { gap: 12, marginTop: 14 },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  itemCardDone: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  tagCode: { fontSize: 11, fontWeight: '800', color: '#0F766E' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chipActive: { backgroundColor: '#EFF6FF' },
  chipDone: { backgroundColor: '#DCFCE7' },
  statusChipText: { fontSize: 10, fontWeight: '800', color: '#1D4ED8' },
  cardHead: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 8 },
  cardHeadDone: { color: '#166534', textDecorationLine: 'line-through' },
  cardMeta: { fontSize: 11, color: '#64748B', marginTop: 4 },
  cardDesc: { fontSize: 12, color: '#475569', marginTop: 4, lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  metaSub: { fontSize: 11, color: '#94A3B8' },
  togglePrompt: { fontSize: 11, color: '#0F766E', fontWeight: '800' },
  scanBtn: { backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  scanBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 12,
    color: '#0F172A',
    marginTop: 14,
  },
  scanBanner: { backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#5EEAD4', padding: 14, borderRadius: 12, marginTop: 12 },
  scanBannerTitle: { fontSize: 12, fontWeight: '800', color: '#0F766E' },
  scanBannerText: { fontSize: 11, color: '#134E4A', marginTop: 4 },
  statusTag: { fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusGreen: { backgroundColor: '#DCFCE7', color: '#166534' },
  statusAmber: { backgroundColor: '#FEF9C3', color: '#854D0E' },
  progressBarWrapper: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 16 },
  progressText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  progressTrack: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0F766E' },
  checkBubble: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#F1F5F9' },
  checkBubblePass: { backgroundColor: '#059669' },
  checkBubbleText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  primaryActionButton: {
    marginTop: 20,
    backgroundColor: '#0F766E',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#0F766E',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  smallActionBtn: { backgroundColor: '#0F766E', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  smallActionBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  periodRow: { flexDirection: 'row', gap: 6 },
  periodBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  periodBtnActive: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  periodText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  periodTextActive: { color: '#FFFFFF' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 16 },
  kpiCard: { width: '48%', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  kpiValue: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  kpiLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginTop: 2 },
  kpiDelta: { fontSize: 10, color: '#059669', marginTop: 6, fontWeight: '600' },
  categoryName: { fontSize: 12, color: '#334155', fontWeight: '600' },
  categoryPct: { fontSize: 11, color: '#64748B', fontWeight: '700' },
  catBarTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginTop: 4, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 3 },
});

