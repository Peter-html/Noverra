import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RequestCategory, RequestPriority, RequestStatus, ServiceRequest } from '../types/cafm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80', // HVAC AC unit leak
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80', // Electrical panel / breaker
  'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80', // Plumbing valve / pipe
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', // Ceiling maintenance
];

const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'CASE-2026-0001',
    title: 'AC unit not cooling & strange buzzing sound',
    description: 'The wall-mounted AC unit in Room 204 is blowing warm air and producing an audible humming vibration since morning. Ambient temperature is 29°C.',
    category: 'HVAC / AC',
    priority: 'High',
    status: 'Under review',
    building: 'Building 1',
    floor: 'Floor 2',
    room: 'Room 204',
    requesterName: 'Anto',
    requesterEmail: 'anto@gmail.com',
    createdAt: 'Today, 09:15 AM',
    photos: [SAMPLE_PHOTOS[0]],
    assignedTechnician: 'Ramesh K. (HVAC Specialist)',
    slaHours: 4,
  },
  {
    id: 'CASE-2026-0002',
    title: 'Water pipe joint leak in secondary washroom',
    description: 'Minor continuous drip observed under the wash basin near the main supply valve. Bucket placed to avoid floor pooling.',
    category: 'Plumbing',
    priority: 'Critical',
    status: 'Assigned',
    building: 'Building 2',
    floor: 'Floor 3',
    room: 'Restroom 3B',
    requesterName: 'Rufin',
    requesterEmail: 'rufin@gmail.com',
    createdAt: 'Today, 11:30 AM',
    photos: [SAMPLE_PHOTOS[2]],
    assignedTechnician: 'Sunil M. (Master Plumber)',
    slaHours: 1,
  },
  {
    id: 'CASE-2026-0003',
    title: 'Overhead LED luminaire flickering intermittently',
    description: 'Ceiling fixture 4 in the primary boardroom is blinking erratically during video conferences. Ballast or driver requires replacement.',
    category: 'Electrical',
    priority: 'Medium',
    status: 'Resolved',
    building: 'HQ Tower',
    floor: 'Floor 4',
    room: 'Boardroom West',
    requesterName: 'Victer',
    requesterEmail: 'victer@gmail.com',
    createdAt: 'Yesterday, 04:45 PM',
    photos: [SAMPLE_PHOTOS[1]],
    assignedTechnician: 'Dinesh P. (Electrician)',
    slaHours: 24,
  },
];

const CATEGORIES: { label: RequestCategory; icon: string }[] = [
  { label: 'HVAC / AC', icon: '❄️' },
  { label: 'Electrical', icon: '⚡' },
  { label: 'Plumbing', icon: '🚰' },
  { label: 'Carpentry', icon: '🔨' },
  { label: 'Cleaning', icon: '🧹' },
  { label: 'Security', icon: '🛡️' },
];

const PRIORITIES: { label: RequestPriority; color: string; bg: string; sla: string }[] = [
  { label: 'Low', color: '#166534', bg: '#DCFCE7', sla: '48h SLA' },
  { label: 'Medium', color: '#854D0E', bg: '#FEF9C3', sla: '24h SLA' },
  { label: 'High', color: '#C2410C', bg: '#FFEDD5', sla: '4h SLA' },
  { label: 'Critical', color: '#991B1B', bg: '#FEE2E2', sla: '1h Emergency' },
];

const BUILDINGS = ['Building 1', 'Building 2', 'HQ West', 'Logistics Center'];
const FLOORS = ['Ground Floor', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];

interface Props {
  currentUser: { name: string; email: string };
  onBack: () => void;
}

export default function ServiceRequestsModule({ currentUser, onBack }: Props) {
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [filter, setFilter] = useState<'All' | 'Open' | 'Resolved'>('All');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Form State for new service request
  const [formCategory, setFormCategory] = useState<RequestCategory>('HVAC / AC');
  const [formPriority, setFormPriority] = useState<RequestPriority>('High');
  const [formBuilding, setFormBuilding] = useState('Building 1');
  const [formFloor, setFormFloor] = useState('Floor 2');
  const [formRoom, setFormRoom] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Filtering
  const filteredRequests = requests.filter(req => {
    if (filter === 'Open') return req.status !== 'Resolved';
    if (filter === 'Resolved') return req.status === 'Resolved';
    return true;
  });

  // Camera capture via expo-image-picker
  async function handleLaunchCamera() {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Camera Access Required',
          'Camera permission is required to capture photos of the maintenance issue. Would you like to use a sample photo for testing?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Attach Sample', onPress: () => handleAddSamplePhoto() },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormPhotos(prev => [...prev, result.assets[0].uri]);
      }
    } catch (e) {
      console.warn('Camera failed (common on simulator/browser), offering sample photo:', e);
      Alert.alert(
        'Physical Camera Unavailable',
        'Physical camera is not available on this simulator/environment. A sample maintenance photo has been attached.',
        [{ text: 'OK', onPress: () => handleAddSamplePhoto() }]
      );
    }
  }

  // Gallery picker
  async function handleLaunchGallery() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Denied', 'Photo library permission is needed to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormPhotos(prev => [...prev, result.assets[0].uri]);
      }
    } catch (e) {
      console.warn('Gallery pick error, fallback to sample:', e);
      handleAddSamplePhoto();
    }
  }

  // Add 1-tap realistic sample photo
  function handleAddSamplePhoto() {
    const nextPhoto = SAMPLE_PHOTOS[formPhotos.length % SAMPLE_PHOTOS.length];
    setFormPhotos(prev => [...prev, nextPhoto]);
  }

  function handleRemovePhoto(index: number) {
    setFormPhotos(prev => prev.filter((_, i) => i !== index));
  }

  function handleOpenCreateModal() {
    setFormCategory('HVAC / AC');
    setFormPriority('High');
    setFormBuilding('Building 1');
    setFormFloor('Floor 2');
    setFormRoom('Room 204');
    setFormTitle('');
    setFormDescription('');
    setFormPhotos([]);
    setFormError('');
    setIsModalVisible(true);
  }

  function handleSubmitRequest() {
    if (!formTitle.trim()) {
      setFormError('Please enter a brief title for this request.');
      return;
    }
    if (!formRoom.trim()) {
      setFormError('Please enter the specific room or area.');
      return;
    }

    const nextIdNumber = requests.length + 1;
    const newId = `CASE-2026-${String(nextIdNumber).padStart(4, '0')}`;

    const newRequest: ServiceRequest = {
      id: newId,
      title: formTitle.trim(),
      description: formDescription.trim() || 'No additional description provided.',
      category: formCategory,
      priority: formPriority,
      status: 'Under review',
      building: formBuilding,
      floor: formFloor,
      room: formRoom.trim(),
      requesterName: currentUser.name,
      requesterEmail: currentUser.email,
      createdAt: 'Just now',
      photos: formPhotos.length > 0 ? formPhotos : [SAMPLE_PHOTOS[0]],
      assignedTechnician: 'Dispatching On-Call Engineer...',
      slaHours: formPriority === 'Critical' ? 1 : formPriority === 'High' ? 4 : formPriority === 'Medium' ? 24 : 48,
    };

    setRequests(prev => [newRequest, ...prev]);
    setIsModalVisible(false);

    Alert.alert(
      'Service Request Submitted! 🚀',
      `Ticket ${newId} has been created and assigned to the facility maintenance team with ${newRequest.slaHours}h SLA.`,
      [{ text: 'View Ticket', onPress: () => setSelectedRequest(newRequest) }, { text: 'Done' }]
    );
  }

  function toggleRequestStatus(reqId: string) {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === reqId) {
          const isResolved = r.status === 'Resolved';
          const updated: ServiceRequest = {
            ...r,
            status: isResolved ? 'Under review' : 'Resolved',
          };
          if (selectedRequest?.id === reqId) {
            setSelectedRequest(updated);
          }
          return updated;
        }
        return r;
      })
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Dashboard</Text>
        </Pressable>
        <Pressable onPress={handleOpenCreateModal} style={styles.createBtn}>
          <Text style={styles.createBtnPlus}>+</Text>
          <Text style={styles.createBtnText}>New Request</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Module Title Banner */}
        <View style={styles.titleBanner}>
          <View>
            <Text style={styles.eyebrow}>CASE MANAGEMENT</Text>
            <Text style={styles.mainTitle}>Service Requests</Text>
            <Text style={styles.mainSubtitle}>Log facility issues, attach camera photos, and track resolution.</Text>
          </View>
        </View>

        {/* Live Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricNum}>{requests.length}</Text>
            <Text style={styles.metricLabel}>Total Requests</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: '#F59E0B', borderLeftWidth: 3 }]}>
            <Text style={[styles.metricNum, { color: '#B45309' }]}>
              {requests.filter(r => r.status !== 'Resolved').length}
            </Text>
            <Text style={styles.metricLabel}>Active / Open</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: '#EF4444', borderLeftWidth: 3 }]}>
            <Text style={[styles.metricNum, { color: '#DC2626' }]}>
              {requests.filter(r => r.priority === 'Critical' || r.priority === 'High').length}
            </Text>
            <Text style={styles.metricLabel}>Urgent Priority</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: '#10B981', borderLeftWidth: 3 }]}>
            <Text style={[styles.metricNum, { color: '#059669' }]}>
              {requests.filter(r => r.status === 'Resolved').length}
            </Text>
            <Text style={styles.metricLabel}>Resolved</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {(['All', 'Open', 'Resolved'] as const).map(tab => (
            <Pressable
              key={tab}
              onPress={() => setFilter(tab)}
              style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}>
                {tab} ({tab === 'All' ? requests.length : tab === 'Open' ? requests.filter(r => r.status !== 'Resolved').length : requests.filter(r => r.status === 'Resolved').length})
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Requests List */}
        <View style={styles.listContainer}>
          {filteredRequests.map(item => {
            const priorityConfig = PRIORITIES.find(p => p.label === item.priority) || PRIORITIES[1];
            const isResolved = item.status === 'Resolved';

            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedRequest(item)}
                style={({ pressed }) => [styles.requestCard, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
              >
                {/* Card Top: ID, Priority, Status */}
                <View style={styles.cardHeader}>
                  <View style={styles.idRow}>
                    <Text style={styles.ticketId}>{item.id}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.bg }]}>
                      <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
                        {item.priority} · {priorityConfig.sla}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, isResolved && styles.statusResolved]}>
                    <Text style={[styles.statusText, isResolved && styles.statusTextResolved]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Title & Description */}
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                {/* Location & Submitter info */}
                <View style={styles.cardMetaRow}>
                  <View style={styles.metaLocation}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.locationText}>
                      {item.building} · {item.floor} · {item.room}
                    </Text>
                  </View>
                  <Text style={styles.metaRequester}>By {item.requesterName}</Text>
                </View>

                {/* Attached Photo Thumbnails */}
                {item.photos && item.photos.length > 0 && (
                  <View style={styles.cardPhotoStrip}>
                    {item.photos.map((uri, idx) => (
                      <View key={idx} style={styles.thumbnailWrap}>
                        <Image source={{ uri }} style={styles.thumbnailImg} resizeMode="cover" />
                        {idx === 0 && (
                          <View style={styles.cameraBadge}>
                            <Text style={styles.cameraBadgeText}>📷 Evidence</Text>
                          </View>
                        )}
                      </View>
                    ))}
                    <View style={styles.cardActionHint}>
                      <Text style={styles.cardActionHintText}>Tap to inspect ↗</Text>
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL: CREATE NEW SERVICE REQUEST WITH CAMERA            */}
      {/* ======================================================== */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalEyebrow}>FACILITY DISPATCH</Text>
              <Text style={styles.modalTitle}>New Service Request</Text>
            </View>
            <Pressable onPress={() => setIsModalVisible(false)} hitSlop={12} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* 1. Category Selection */}
            <Text style={styles.formSectionLabel}>1. SELECT CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => {
                const isSelected = formCategory === cat.label;
                return (
                  <Pressable
                    key={cat.label}
                    onPress={() => setFormCategory(cat.label)}
                    style={[styles.categoryBtn, isSelected && styles.categoryBtnSelected]}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 2. Priority Selection */}
            <Text style={styles.formSectionLabel}>2. PRIORITY LEVEL & SLA</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map(pri => {
                const isSelected = formPriority === pri.label;
                return (
                  <Pressable
                    key={pri.label}
                    onPress={() => setFormPriority(pri.label)}
                    style={[
                      styles.priorityOption,
                      isSelected && { borderColor: pri.color, backgroundColor: pri.bg },
                    ]}
                  >
                    <Text style={[styles.priorityOptLabel, isSelected && { color: pri.color, fontWeight: '800' }]}>
                      {pri.label}
                    </Text>
                    <Text style={styles.priorityOptSla}>{pri.sla}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 3. Location Details */}
            <Text style={styles.formSectionLabel}>3. LOCATION IN FACILITY</Text>
            <View style={styles.locationSelectorRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subInputLabel}>BUILDING</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  {BUILDINGS.map(b => (
                    <Pressable
                      key={b}
                      onPress={() => setFormBuilding(b)}
                      style={[styles.chip, formBuilding === b && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, formBuilding === b && styles.chipTextActive]}>{b}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.locationSelectorRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subInputLabel}>FLOOR</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  {FLOORS.map(f => (
                    <Pressable
                      key={f}
                      onPress={() => setFormFloor(f)}
                      style={[styles.chip, formFloor === f && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, formFloor === f && styles.chipTextActive]}>{f}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Text style={styles.subInputLabel}>SPECIFIC ROOM / AREA</Text>
            <TextInput
              placeholder="e.g. Room 204, Conference Room B, Server Hall"
              placeholderTextColor="#9AA6A1"
              value={formRoom}
              onChangeText={t => { setFormRoom(t); setFormError(''); }}
              style={styles.textInput}
            />

            {/* 4. Issue Description */}
            <Text style={styles.formSectionLabel}>4. ISSUE DETAILS</Text>
            <Text style={styles.subInputLabel}>SUMMARY / TITLE *</Text>
            <TextInput
              placeholder="e.g. Water leak from ceiling / AC not cooling"
              placeholderTextColor="#9AA6A1"
              value={formTitle}
              onChangeText={t => { setFormTitle(t); setFormError(''); }}
              style={styles.textInput}
            />

            <Text style={styles.subInputLabel}>DETAILED DESCRIPTION</Text>
            <TextInput
              placeholder="Describe symptoms, equipment tag, audible noise, or impact on occupants..."
              placeholderTextColor="#9AA6A1"
              value={formDescription}
              onChangeText={setFormDescription}
              multiline
              numberOfLines={3}
              style={[styles.textInput, styles.textArea]}
            />

            {/* 5. Camera & Photo Evidence (Core Feature!) */}
            <Text style={styles.formSectionLabel}>5. PHOTO EVIDENCE (CAMERA / GALLERY)</Text>
            <Text style={styles.photoExplainer}>
              Capture visual evidence with your camera so the technician arrives with the right tools and replacement parts.
            </Text>

            {/* Photo Action Buttons */}
            <View style={styles.photoActionsRow}>
              <Pressable onPress={handleLaunchCamera} style={styles.cameraActionBtn}>
                <Text style={styles.cameraActionIcon}>📷</Text>
                <Text style={styles.cameraActionText}>Take Photo</Text>
              </Pressable>

              <Pressable onPress={handleLaunchGallery} style={styles.galleryActionBtn}>
                <Text style={styles.galleryActionIcon}>🖼️</Text>
                <Text style={styles.galleryActionText}>Gallery</Text>
              </Pressable>

              <Pressable onPress={handleAddSamplePhoto} style={styles.sampleActionBtn}>
                <Text style={styles.sampleActionIcon}>✨</Text>
                <Text style={styles.sampleActionText}>Sample Photo</Text>
              </Pressable>
            </View>

            {/* Photo Preview Strip */}
            {formPhotos.length > 0 ? (
              <View style={styles.photoPreviewSection}>
                <Text style={styles.photoCountLabel}>{formPhotos.length} photo(s) attached:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewStrip}>
                  {formPhotos.map((uri, idx) => (
                    <View key={idx} style={styles.previewBox}>
                      <Image source={{ uri }} style={styles.previewImage} resizeMode="cover" />
                      <Pressable onPress={() => handleRemovePhoto(idx)} style={styles.removePhotoBtn}>
                        <Text style={styles.removePhotoText}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.emptyPhotoBox}>
                <Text style={styles.emptyPhotoIcon}>📸</Text>
                <Text style={styles.emptyPhotoText}>No photo attached yet.</Text>
                <Text style={styles.emptyPhotoSub}>Tap 'Take Photo' or 'Sample Photo' above.</Text>
              </View>
            )}

            {/* Error Notice */}
            {!!formError && <Text style={styles.formErrorText}>{formError}</Text>}

            {/* Requester Tag */}
            <View style={styles.requesterBanner}>
              <Text style={styles.requesterBannerText}>
                Submitting as: <Text style={{ fontWeight: '800' }}>{currentUser.name}</Text> ({currentUser.email})
              </Text>
            </View>

            {/* Submit Button */}
            <Pressable onPress={handleSubmitRequest} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>Submit Service Request ↗</Text>
            </Pressable>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: INSPECT / RESOLVE REQUEST DETAIL                  */}
      {/* ======================================================== */}
      <Modal visible={!!selectedRequest} animationType="slide" presentationStyle="pageSheet">
        {selectedRequest && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>{selectedRequest.id}</Text>
                <Text style={styles.modalTitle}>{selectedRequest.category}</Text>
              </View>
              <Pressable onPress={() => setSelectedRequest(null)} hitSlop={12} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Status and Priority Badges */}
              <View style={styles.detailBadgeRow}>
                <View style={[styles.priorityBadge, { paddingHorizontal: 12, paddingVertical: 6 }]}>
                  <Text style={[styles.priorityText, { fontSize: 13, fontWeight: '800' }]}>
                    {selectedRequest.priority} Priority · {selectedRequest.slaHours}h SLA
                  </Text>
                </View>
                <View style={[styles.statusBadge, selectedRequest.status === 'Resolved' && styles.statusResolved]}>
                  <Text style={[styles.statusText, selectedRequest.status === 'Resolved' && styles.statusTextResolved]}>
                    {selectedRequest.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.detailTitleText}>{selectedRequest.title}</Text>
              <Text style={styles.detailDescText}>{selectedRequest.description}</Text>

              {/* Photo Evidence in Full Width */}
              {selectedRequest.photos && selectedRequest.photos.length > 0 && (
                <View style={styles.detailPhotoBox}>
                  <Text style={styles.detailPhotoHeader}>ATTACHED PHOTO EVIDENCE (CAMERA CAPTURE)</Text>
                  {selectedRequest.photos.map((uri, i) => (
                    <View key={i} style={styles.largePhotoWrap}>
                      <Image source={{ uri }} style={styles.largePhoto} resizeMode="cover" />
                      <View style={styles.photoWatermark}>
                        <Text style={styles.photoWatermarkText}>📍 {selectedRequest.building} · {selectedRequest.room}</Text>
                        <Text style={styles.photoWatermarkText}>🕒 {selectedRequest.createdAt}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Location & Details Card */}
              <View style={styles.detailInfoCard}>
                <Text style={styles.detailInfoLabel}>LOCATION</Text>
                <Text style={styles.detailInfoVal}>
                  {selectedRequest.building} / {selectedRequest.floor} / {selectedRequest.room}
                </Text>

                <Text style={[styles.detailInfoLabel, { marginTop: 14 }]}>REQUESTER</Text>
                <Text style={styles.detailInfoVal}>
                  {selectedRequest.requesterName} ({selectedRequest.requesterEmail})
                </Text>

                <Text style={[styles.detailInfoLabel, { marginTop: 14 }]}>ASSIGNED ENGINEER</Text>
                <Text style={styles.detailInfoVal}>
                  {selectedRequest.assignedTechnician || 'Auto-dispatching engineer...'}
                </Text>

                <Text style={[styles.detailInfoLabel, { marginTop: 14 }]}>TIMESTAMPS</Text>
                <Text style={styles.detailInfoVal}>Reported: {selectedRequest.createdAt}</Text>
              </View>

              {/* Action: Mark as Resolved / Re-open */}
              <Pressable
                onPress={() => toggleRequestStatus(selectedRequest.id)}
                style={[
                  styles.resolveToggleBtn,
                  selectedRequest.status === 'Resolved' && { backgroundColor: '#1E293B' },
                ]}
              >
                <Text style={styles.resolveToggleText}>
                  {selectedRequest.status === 'Resolved' ? '↺ Re-open Request' : '✓ Mark as Resolved'}
                </Text>
              </Pressable>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: { paddingVertical: 6 },
  backBtnText: { color: '#0F766E', fontSize: 13, fontWeight: '700' },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F766E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#0F766E',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  createBtnPlus: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', lineHeight: 18 },
  createBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 60, maxWidth: 700, width: '100%', alignSelf: 'center' },
  titleBanner: { marginBottom: 20 },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: '800', color: '#64748B' },
  mainTitle: { fontSize: 30, fontWeight: '900', color: '#0F172A', letterSpacing: -1, marginTop: 4 },
  mainSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 19 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricNum: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  metricLabel: { fontSize: 10, color: '#64748B', fontWeight: '700', marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabActive: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  filterTabText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  filterTabTextActive: { color: '#FFFFFF' },
  listContainer: { gap: 14 },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ticketId: { fontSize: 12, fontWeight: '800', color: '#0F766E' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  priorityText: { fontSize: 10, fontWeight: '800' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusResolved: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#1D4ED8' },
  statusTextResolved: { color: '#047857' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 10 },
  cardDesc: { fontSize: 12, color: '#475569', marginTop: 4, lineHeight: 18 },
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  metaLocation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationIcon: { fontSize: 11 },
  locationText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  metaRequester: { fontSize: 11, color: '#94A3B8' },
  cardPhotoStrip: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  thumbnailWrap: { width: 62, height: 62, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  thumbnailImg: { width: '100%', height: '100%' },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 4,
    paddingVertical: 2,
    alignItems: 'center',
  },
  cameraBadgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '700' },
  cardActionHint: { flex: 1, alignItems: 'flex-end' },
  cardActionHintText: { fontSize: 11, color: '#0F766E', fontWeight: '700' },

  // MODAL STYLING
  modalContainer: { flex: 1, backgroundColor: '#F8FAF9' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 24 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalEyebrow: { fontSize: 9, letterSpacing: 1.5, fontWeight: '800', color: '#64748B' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: { fontSize: 14, color: '#475569', fontWeight: '800' },
  modalScroll: { flex: 1, padding: 22 },
  formSectionLabel: { fontSize: 11, letterSpacing: 1.4, fontWeight: '900', color: '#0F766E', marginTop: 18, marginBottom: 10 },
  subInputLabel: { fontSize: 10, letterSpacing: 1, fontWeight: '800', color: '#64748B', marginTop: 12, marginBottom: 6 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryBtnSelected: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  categoryIcon: { fontSize: 14 },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: '#334155' },
  categoryLabelSelected: { color: '#FFFFFF' },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  priorityOptLabel: { fontSize: 12, fontWeight: '700', color: '#334155' },
  priorityOptSla: { fontSize: 9, color: '#64748B', marginTop: 2 },
  locationSelectorRow: { marginBottom: 4 },
  chipRow: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  chipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: { height: 85, paddingTop: 12, textAlignVertical: 'top' },
  photoExplainer: { fontSize: 11, color: '#64748B', lineHeight: 17, marginBottom: 12 },
  photoActionsRow: { flexDirection: 'row', gap: 10 },
  cameraActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F766E',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#0F766E',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  cameraActionIcon: { fontSize: 16 },
  cameraActionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  galleryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 12,
  },
  galleryActionIcon: { fontSize: 15 },
  galleryActionText: { color: '#334155', fontSize: 12, fontWeight: '700' },
  sampleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sampleActionIcon: { fontSize: 14 },
  sampleActionText: { color: '#475569', fontSize: 11, fontWeight: '700' },
  emptyPhotoBox: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  emptyPhotoIcon: { fontSize: 26, marginBottom: 6 },
  emptyPhotoText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  emptyPhotoSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  photoPreviewSection: { marginTop: 14 },
  photoCountLabel: { fontSize: 11, fontWeight: '700', color: '#0F766E', marginBottom: 8 },
  previewStrip: { flexDirection: 'row', gap: 10 },
  previewBox: { width: 90, height: 90, borderRadius: 12, overflow: 'hidden', position: 'relative', marginRight: 10 },
  previewImage: { width: '100%', height: '100%' },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  formErrorText: { color: '#DC2626', fontSize: 12, marginTop: 12, fontWeight: '700' },
  requesterBanner: { marginTop: 18, backgroundColor: '#F1F5F9', padding: 12, borderRadius: 10 },
  requesterBannerText: { fontSize: 11, color: '#475569' },
  submitBtn: {
    marginTop: 20,
    backgroundColor: '#0F766E',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#0F766E',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  // DETAIL MODAL STYLES
  detailBadgeRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 14 },
  detailTitleText: { fontSize: 22, fontWeight: '900', color: '#0F172A', lineHeight: 28 },
  detailDescText: { fontSize: 13, color: '#475569', lineHeight: 21, marginTop: 8 },
  detailPhotoBox: { marginTop: 20 },
  detailPhotoHeader: { fontSize: 10, letterSpacing: 1.5, fontWeight: '900', color: '#64748B', marginBottom: 8 },
  largePhotoWrap: {
    width: '100%',
    height: 210,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  largePhoto: { width: '100%', height: '100%' },
  photoWatermark: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoWatermarkText: { color: '#E2E8F0', fontSize: 10, fontWeight: '700' },
  detailInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailInfoLabel: { fontSize: 9, letterSpacing: 1.5, fontWeight: '900', color: '#94A3B8' },
  detailInfoVal: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 3 },
  resolveToggleBtn: {
    marginTop: 20,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  resolveToggleText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
