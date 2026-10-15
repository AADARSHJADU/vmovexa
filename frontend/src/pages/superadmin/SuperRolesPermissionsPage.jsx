import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSuperRole } from '../../hooks/superadmin/useSuperRole';
import { RefreshButton } from '../../components/ui/RefreshButton';

// ==========================================
// Vector SVG Icons for Enterprise UI
// ==========================================
const Icons = {
  Shield: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Building: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  Bus: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h8m-8 4h4m4 6H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2zM9 19v2m6-2v2M6 15v1m12-1v1" />
    </svg>
  ),
  UserCheck: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5l-4.5 4.5L12 9.5M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Wrench: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.04a4.5 4.5 0 004.486-6.32l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.32 4.486c.149.58.125 1.193-.039 1.743z" />
    </svg>
  ),
  Megaphone: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ),
  Landmark: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5m-15 10.5V10.5M3 21h18M3 10.5h18" />
    </svg>
  ),
  Coins: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Users: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Lock: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  Search: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  Plus: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Check: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Refresh: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  Trash: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Edit: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  ChevronDown: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  Key: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
  Layers: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
  ),
  Cpu: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9a.75.75 0 01.75.75v9a.75.75 0 01-.75.75h-9a.75.75 0 01-.75-.75v-9a.75.75 0 01.75-.75z" />
    </svg>
  ),
  AlertCircle: ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
};

// Helper: Role Icon Selector
function getRoleIcon(roleCode, category) {
  const code = String(roleCode || '').toUpperCase();
  if (code.includes('SUPER-ADMIN')) return Icons.Shield;
  if (code.includes('TENANT') || code.includes('ADMIN')) return Icons.Building;
  if (code.includes('FLEET')) return Icons.Bus;
  if (code.includes('DRIVER')) return Icons.UserCheck;
  if (code.includes('TECH')) return Icons.Wrench;
  if (code.includes('ADVERTISER')) return Icons.Megaphone;
  if (code.includes('GOVT')) return Icons.Landmark;
  if (code.includes('FINANCE')) return Icons.Coins;
  if (category === 'Fleet') return Icons.Bus;
  if (category === 'Finance') return Icons.Coins;
  if (category === 'Driver') return Icons.UserCheck;
  return Icons.Key;
}

// Helper: Module Icon Selector
function getModuleIcon(moduleName) {
  const mod = String(moduleName || '').toLowerCase();
  if (mod.includes('fleet')) return Icons.Bus;
  if (mod.includes('user')) return Icons.Users;
  if (mod.includes('rbac') || mod.includes('role')) return Icons.Key;
  if (mod.includes('org') || mod.includes('tenant')) return Icons.Building;
  if (mod.includes('device') || mod.includes('screen')) return Icons.Cpu;
  if (mod.includes('campaign') || mod.includes('ad')) return Icons.Megaphone;
  if (mod.includes('finance') || mod.includes('billing')) return Icons.Coins;
  if (mod.includes('driver')) return Icons.UserCheck;
  if (mod.includes('work') || mod.includes('tech')) return Icons.Wrench;
  return Icons.Layers;
}

// Helper: Clean Role Name Formatter
function formatRoleName(role) {
  if (!role) return 'Role';
  const code = String(role.code || '').toUpperCase();
  const name = String(role.name || '');

  if (code === 'ROLE-SUPER-ADMIN' || name.includes('Super Admin')) return 'Super Admin';
  if (code === 'ROLE-TENANT-ADMIN' || name.includes('Organization Admin')) return 'Organization Admin';
  if (code === 'ROLE-FLEET-OPERATOR' || name.includes('Fleet')) return 'Fleet Operator';
  if (code === 'ROLE-DRIVER' || name.includes('Driver')) return 'Driver';
  if (code === 'ROLE-CENTRAL-TECH' || name.includes('Technician')) return 'Technician';
  if (code === 'ROLE-ADVERTISER' || name.includes('Advertiser')) return 'Advertiser';
  if (code === 'ROLE-GOVT-AGENCY' || name.includes('Government')) return 'Government Agency';
  if (code === 'ROLE-FINANCE-OFFICER' || name.includes('Finance')) return 'Finance Officer';
  return name.replace(/\(.*\)/g, '').trim() || role.code;
}

export const SuperRolesPermissionsPage = () => {
  const {
    roles,
    permissions,
    loading,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    updateRolePermissions,
    loadPermissions,
    loadPermissionModules,
  } = useSuperRole();

  // Selected Role & Working Permission IDs
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [activePermIds, setActivePermIds] = useState(new Set());

  // Filters & Search
  const [roleSearch, setRoleSearch] = useState('');
  const [roleFilterTab, setRoleFilterTab] = useState('ALL'); // 'ALL' | 'SYSTEM' | 'CUSTOM'
  const [permSearch, setPermSearch] = useState('');
  const [permFilterMode, setPermFilterMode] = useState('ALL'); // Default to ALL so all permissions remain visible
  const [sessionToggledIds, setSessionToggledIds] = useState(new Set()); // Keep toggled items pinned in view
  const [selectedModule, setSelectedModule] = useState('ALL');

  // Accordion state: map of moduleName -> boolean
  const [collapsedModules, setCollapsedModules] = useState({});

  // Action states
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form State
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    category: 'Platform',
    description: '',
    cloneFromRoleId: '',
  });

  const [editRoleForm, setEditRoleForm] = useState({
    name: '',
    category: 'Platform',
    description: '',
  });

  // Initial Data Load
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadRoles(),
        loadPermissions(),
        loadPermissionModules(),
      ]);
    } catch (_) {
      // Handled via toast in service
    } finally {
      setRefreshing(false);
    }
  }, [loadRoles, loadPermissions, loadPermissionModules]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const roleList = useMemo(() => (Array.isArray(roles) ? roles : []), [roles]);
  const allPermsList = useMemo(() => (Array.isArray(permissions) ? permissions : []), [permissions]);

  // Set default selected role to Organization Admin or first customizable role
  useEffect(() => {
    if (roleList.length > 0 && !selectedRoleId) {
      const defaultRole = roleList.find((r) => r.code === 'ROLE-TENANT-ADMIN') || roleList[0];
      setSelectedRoleId(defaultRole.id);
    }
  }, [roleList, selectedRoleId]);

  const selectedRole = useMemo(() => {
    if (!selectedRoleId) return null;
    return roleList.find((r) => r.id === selectedRoleId) || null;
  }, [roleList, selectedRoleId]);

  // Sync active permissions when role changes
  useEffect(() => {
    if (!selectedRole) {
      setActivePermIds(new Set());
      return;
    }
    const ids = (selectedRole.permissions || []).map((p) => (typeof p === 'object' ? p.id : p));
    setActivePermIds(new Set(ids));
    setSessionToggledIds(new Set());
  }, [selectedRole?.id]);

  // Unsaved changes check
  const isDirty = useMemo(() => {
    if (!selectedRole) return false;
    const initialIds = new Set((selectedRole.permissions || []).map((p) => (typeof p === 'object' ? p.id : p)));
    if (initialIds.size !== activePermIds.size) return true;
    for (const id of activePermIds) {
      if (!initialIds.has(id)) return true;
    }
    return false;
  }, [selectedRole, activePermIds]);

  const isSuperAdmin = selectedRole?.code === 'ROLE-SUPER-ADMIN';
  const isSystemRole = Boolean(selectedRole?.is_system || selectedRole?.isSystem);

  // Group all permissions by Module
  const groupedModules = useMemo(() => {
    const map = {};
    allPermsList.forEach((p) => {
      const mod = p.module || 'General';
      if (!map[mod]) map[mod] = [];
      map[mod].push(p);
    });
    return map;
  }, [allPermsList]);

  const availableModuleNames = useMemo(() => Object.keys(groupedModules).sort(), [groupedModules]);

  // Filtered Roles list
  const filteredRoles = useMemo(() => {
    return roleList.filter((r) => {
      const isSys = Boolean(r.is_system || r.isSystem);
      if (roleFilterTab === 'SYSTEM' && !isSys) return false;
      if (roleFilterTab === 'CUSTOM' && isSys) return false;

      if (roleSearch.trim()) {
        const query = roleSearch.toLowerCase();
        const matchName = (r.name || '').toLowerCase().includes(query);
        const matchCode = (r.code || '').toLowerCase().includes(query);
        const matchCat = (r.category || '').toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchCat) return false;
      }
      return true;
    });
  }, [roleList, roleFilterTab, roleSearch]);

  // Filtered and Grouped Permissions for Selected Role
  const filteredGroupedPermissions = useMemo(() => {
    const result = {};
    const query = permSearch.trim().toLowerCase();

    Object.entries(groupedModules).forEach(([modName, perms]) => {
      if (selectedModule !== 'ALL' && modName !== selectedModule) return;

      const filtered = perms.filter((p) => {
        const isAssigned = activePermIds.has(p.id);
        const wasToggledThisSession = sessionToggledIds.has(p.id);

        // Never hide an item that was toggled in the current view session
        if (!wasToggledThisSession) {
          if (permFilterMode === 'ACTIVE' && !isAssigned) return false;
          if (permFilterMode === 'INACTIVE' && isAssigned) return false;
        }

        if (query) {
          const matchLabel = (p.label || '').toLowerCase().includes(query);
          const matchKey = (p.key || '').toLowerCase().includes(query);
          const matchMod = (p.module || '').toLowerCase().includes(query);
          if (!matchLabel && !matchKey && !matchMod) return false;
        }
        return true;
      });

      if (filtered.length > 0) {
        result[modName] = filtered;
      }
    });

    return result;
  }, [groupedModules, selectedModule, permFilterMode, permSearch, activePermIds, sessionToggledIds]);

  // Total visible permissions count
  const visiblePermissionsCount = useMemo(() => {
    return Object.values(filteredGroupedPermissions).reduce((acc, list) => acc + list.length, 0);
  }, [filteredGroupedPermissions]);

  // Active perms ref to prevent race conditions during rapid toggling
  const activePermIdsRef = useRef(activePermIds);
  useEffect(() => {
    activePermIdsRef.current = activePermIds;
  }, [activePermIds]);

  const saveTimerRef = useRef(null);

  // Auto-save function with debounce
  const triggerAutoSave = useCallback((newSet, roleId) => {
    if (!roleId || isSuperAdmin) return;
    
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSaving(true);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const idsToSave = Array.from(newSet);
        await updateRolePermissions(roleId, idsToSave);
        await loadRoles();
        toast.success('Permissions auto-saved!', { id: `auto-save-${roleId}` });
      } catch (err) {
        toast.error(err?.message || 'Failed to auto-save permissions');
      } finally {
        setSaving(false);
      }
    }, 200);
  }, [isSuperAdmin, updateRolePermissions, loadRoles]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Toggle single permission with instant auto-save
  const handleTogglePerm = (permId) => {
    if (isSuperAdmin) {
      toast.error('Super Admin permissions are system-locked to 100% platform access.');
      return;
    }
    if (!selectedRole) return;

    const next = new Set(activePermIdsRef.current);
    const willBeActive = !next.has(permId);
    if (willBeActive) {
      next.add(permId);
    } else {
      next.delete(permId);
    }

    activePermIdsRef.current = next;
    setActivePermIds(next);
    setSessionToggledIds((prev) => new Set(prev).add(permId));

    triggerAutoSave(next, selectedRole.id);
  };

  // Toggle entire module with instant auto-save
  const handleToggleModule = (moduleName, enableAll) => {
    if (isSuperAdmin) {
      toast.error('Super Admin permissions are locked.');
      return;
    }
    if (!selectedRole) return;

    const modulePerms = groupedModules[moduleName] || [];
    const next = new Set(activePermIdsRef.current);

    modulePerms.forEach((p) => {
      if (enableAll) {
        next.add(p.id);
      } else {
        next.delete(p.id);
      }
    });

    activePermIdsRef.current = next;
    setActivePermIds(next);
    setSessionToggledIds((prev) => {
      const updated = new Set(prev);
      modulePerms.forEach((p) => updated.add(p.id));
      return updated;
    });

    triggerAutoSave(next, selectedRole.id);
  };

  // Toggle module accordion expand/collapse
  const toggleModuleAccordion = (modName) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [modName]: !prev[modName],
    }));
  };

  // Batch Select / Deselect Visible with instant auto-save
  const handleSelectAllVisible = () => {
    if (isSuperAdmin || !selectedRole) return;
    const next = new Set(activePermIdsRef.current);
    const toggled = [];
    Object.values(filteredGroupedPermissions).forEach((list) => {
      list.forEach((p) => {
        next.add(p.id);
        toggled.push(p.id);
      });
    });

    activePermIdsRef.current = next;
    setActivePermIds(next);
    setSessionToggledIds((prev) => {
      const updated = new Set(prev);
      toggled.forEach((id) => updated.add(id));
      return updated;
    });

    triggerAutoSave(next, selectedRole.id);
  };

  const handleDeselectAllVisible = () => {
    if (isSuperAdmin || !selectedRole) return;
    const next = new Set(activePermIdsRef.current);
    const toggled = [];
    Object.values(filteredGroupedPermissions).forEach((list) => {
      list.forEach((p) => {
        next.delete(p.id);
        toggled.push(p.id);
      });
    });

    activePermIdsRef.current = next;
    setActivePermIds(next);
    setSessionToggledIds((prev) => {
      const updated = new Set(prev);
      toggled.forEach((id) => updated.add(id));
      return updated;
    });

    triggerAutoSave(next, selectedRole.id);
  };

  // Expand / Collapse All
  const handleExpandAll = () => {
    setCollapsedModules({});
  };

  const handleCollapseAll = () => {
    const all = {};
    availableModuleNames.forEach((name) => { all[name] = true; });
    setCollapsedModules(all);
  };

  // Discard changes
  const handleDiscardChanges = () => {
    if (!selectedRole) return;
    const ids = (selectedRole.permissions || []).map((p) => (typeof p === 'object' ? p.id : p));
    setActivePermIds(new Set(ids));
    setSessionToggledIds(new Set());
    toast.success('Reverted modifications');
  };

  // Save Permissions manually (fallback)
  const handleSavePermissions = async () => {
    if (!selectedRole || isSuperAdmin) return;
    setSaving(true);
    try {
      await updateRolePermissions(selectedRole.id, Array.from(activePermIdsRef.current));
      await loadRoles();
      toast.success(`Permissions successfully updated for ${formatRoleName(selectedRole)}!`);
    } catch (err) {
      toast.error(err?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  // Create Role Submit
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) return;

    let initialPermissionIds = [];
    if (newRoleForm.cloneFromRoleId) {
      const template = roleList.find((r) => String(r.id) === String(newRoleForm.cloneFromRoleId));
      if (template && Array.isArray(template.permissions)) {
        initialPermissionIds = template.permissions.map((p) => (typeof p === 'object' ? p.id : p));
      }
    }

    try {
      const created = await toast.promise(
        createRole({
          name: newRoleForm.name.trim(),
          category: newRoleForm.category,
          description: newRoleForm.description.trim() || null,
          permissionIds: initialPermissionIds,
        }),
        {
          loading: 'Creating new role...',
          success: 'Custom role created successfully!',
          error: (err) => err?.message || 'Failed to create role',
        }
      );

      if (created?.id) setSelectedRoleId(created.id);
      setShowCreateModal(false);
      setNewRoleForm({ name: '', category: 'Platform', description: '', cloneFromRoleId: '' });
      await loadRoles();
    } catch (_) {}
  };

  // Open Edit Role Modal
  const handleOpenEditModal = () => {
    if (!selectedRole || isSystemRole) return;
    setEditRoleForm({
      name: selectedRole.name || '',
      category: selectedRole.category || 'Platform',
      description: selectedRole.description || '',
    });
    setShowEditModal(true);
  };

  // Update Role Submit
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedRole || isSystemRole) return;
    try {
      await toast.promise(
        updateRole(selectedRole.id, {
          name: editRoleForm.name.trim(),
          category: editRoleForm.category,
          description: editRoleForm.description.trim() || null,
        }),
        {
          loading: 'Updating role details...',
          success: 'Role updated successfully!',
          error: (err) => err?.message || 'Failed to update role',
        }
      );
      setShowEditModal(false);
      await loadRoles();
    } catch (_) {}
  };

  // Delete Role Submit
  const handleDeleteRole = async () => {
    if (!selectedRole || isSystemRole) return;
    try {
      await toast.promise(
        deleteRole(selectedRole.id),
        {
          loading: 'Deleting custom role...',
          success: 'Role deleted successfully!',
          error: (err) => err?.message || 'Failed to delete role',
        }
      );
      setShowDeleteModal(false);
      setSelectedRoleId(null);
      await loadRoles();
    } catch (_) {}
  };

  // Selected Role metrics
  const activeCount = activePermIds.size;
  const totalCount = allPermsList.length;
  const coveragePercent = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  return (
    <div className="w-full space-y-6 pb-24 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
              <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
                Super Admin
              </Link>
              <span>/</span>
              <span>Access Control</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-zinc-200 font-bold">Roles & Permissions</span>
            </nav>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                Roles & Access Management
              </h1>
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold">
                Enterprise RBAC
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-normal max-w-2xl">
              Configure system roles, fine-grained privilege assignments, and modular feature entitlements across all tenant boundaries.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <RefreshButton
              onClick={handleRefresh}
              loading={refreshing}
              label="Sync"
              loadingLabel="Syncing…"
              title="Refresh roles and permissions"
            />

            <Link
              to="/superadmin/users"
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Icons.Users className="w-3.5 h-3.5 text-blue-500" />
              <span>Users</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
            >
              <Icons.Plus className="w-3.5 h-3.5" />
              <span>Create Custom Role</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5 pt-5 border-t border-slate-100 dark:border-zinc-800">
          <div className="bg-slate-50/70 dark:bg-zinc-800/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
            <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Total Roles</div>
            <div className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-0.5">{roleList.length}</div>
          </div>
          <div className="bg-slate-50/70 dark:bg-zinc-800/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
            <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Master Permissions</div>
            <div className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-0.5">{allPermsList.length}</div>
          </div>
          <div className="bg-slate-50/70 dark:bg-zinc-800/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
            <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Functional Modules</div>
            <div className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-0.5">{availableModuleNames.length}</div>
          </div>
          <div className="bg-slate-50/70 dark:bg-zinc-800/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
            <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Active Role Privileges</div>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {activeCount} <span className="text-xs font-normal text-slate-400">({coveragePercent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ROLE DIRECTORY ROW (Placed horizontally DIRECTLY ABOVE Organization Admin / Workbench) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Row Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Icons.Layers className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                Role Directory ({filteredRoles.length})
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/70 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setRoleFilterTab('ALL')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  roleFilterTab === 'ALL'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                }`}
              >
                All ({roleList.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilterTab('SYSTEM')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  roleFilterTab === 'SYSTEM'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                }`}
              >
                System ({roleList.filter((r) => r.is_system || r.isSystem).length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilterTab('CUSTOM')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  roleFilterTab === 'CUSTOM'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                }`}
              >
                Custom ({roleList.filter((r) => !r.is_system && !r.isSystem).length})
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search roles by name or code..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs px-3 py-1.5 pl-8 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <Icons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>

        {/* Roles Horizontal Cards Row (Grid of 8 columns on XL, 4 on MD, 2 on SM) */}
        {loading && roleList.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-28 rounded-xl bg-slate-100 dark:bg-zinc-800/50 animate-pulse" />
            ))}
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 dark:text-zinc-500">
            No roles match the filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-2.5">
            {filteredRoles.map((r) => {
              const isSelected = selectedRoleId === r.id;
              const isSys = Boolean(r.is_system || r.isSystem);
              const IconComponent = getRoleIcon(r.code, r.category);
              const count = (r.permissions || []).length;
              const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRoleId(r.id);
                    setPermFilterMode('ALL');
                    setSessionToggledIds(new Set());
                  }}
                  className={`group p-3 rounded-xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between gap-2.5 relative ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-sm shadow-blue-500/10 ring-1 ring-blue-500'
                      : 'bg-slate-50/60 dark:bg-zinc-800/40 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800'
                  }`}
                >
                  {/* Card Header: Icon & System Tag */}
                  <div className="flex items-center justify-between gap-1 w-full">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                          : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 group-hover:text-blue-600'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : isSys
                          ? 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400'
                          : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400'
                      }`}
                    >
                      {isSys ? 'System' : 'Custom'}
                    </span>
                  </div>

                  {/* Card Middle: Role Name & Code */}
                  <div className="min-w-0">
                    <h3 className={`text-xs font-bold truncate leading-tight ${
                      isSelected ? 'text-blue-950 dark:text-blue-100' : 'text-slate-900 dark:text-zinc-100'
                    }`}>
                      {formatRoleName(r)}
                    </h3>
                    <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                      {r.code}
                    </div>
                  </div>

                  {/* Card Bottom: Perms Count & Progress Bar */}
                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                      <span>{count} perms</span>
                      {isSelected ? (
                        <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5">
                          <Icons.Check className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span>{percent}%</span>
                      )}
                    </div>
                    <div className="w-full bg-slate-200/70 dark:bg-zinc-700 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSelected ? 'bg-blue-600' : 'bg-slate-400 dark:bg-zinc-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. FULL-WIDTH ROLE PERMISSION WORKBENCH ("Organization Admin" / Selected Role) */}
      {!selectedRole ? (
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Icons.Shield className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Select a Role</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            Choose any role from the directory above to review, inspect, and configure its permissions matrix.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selected Role Profile Banner */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                {(() => {
                  const IconC = getRoleIcon(selectedRole.code, selectedRole.category);
                  return (
                    <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm shadow-blue-500/20 shrink-0">
                      <IconC className="w-5 h-5" />
                    </div>
                  );
                })()}

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                      {formatRoleName(selectedRole)}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                      {selectedRole.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                      {selectedRole.category || 'Platform'}
                    </span>
                    {saving ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 flex items-center gap-1">
                        <Icons.Refresh className="w-2.5 h-2.5 animate-spin" />
                        <span>Saving...</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1">
                        <Icons.Check className="w-2.5 h-2.5" />
                        <span>Auto-saved</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-normal">
                    {selectedRole.description || 'System access role with assigned privilege policies across VMOVEXA ONE modules.'}
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {!isSystemRole && (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenEditModal}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Icons.Edit className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Icons.Trash className="w-3.5 h-3.5" />
                      <span>Delete Role</span>
                    </button>
                  </>
                )}

                {!isSuperAdmin && (
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 shadow-2xs">
                    {saving ? (
                      <>
                        <Icons.Refresh className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        <span className="text-blue-600 dark:text-blue-400">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Icons.Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 dark:text-emerald-400">Auto-saved ✓</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* System Lock Notice for Super Admin */}
            {isSuperAdmin && (
              <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-900 dark:text-blue-300 font-medium flex items-center gap-2.5">
                <Icons.Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <strong>Root Sovereign Role:</strong> Super Admin holds platform-level bypass and inherently possesses 100% of all current and future permissions.
                </div>
              </div>
            )}
          </div>

          {/* Permissions Control Toolbar */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Permissions */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search permissions by label or key (e.g., fleet.vehicles.view)..."
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs px-3 py-2 pl-8 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
                <Icons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              {/* Filter Mode (All / Active / Inactive) */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setPermFilterMode('ALL');
                    setSessionToggledIds(new Set());
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    permFilterMode === 'ALL'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                  }`}
                >
                  All ({allPermsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPermFilterMode('ACTIVE');
                    setSessionToggledIds(new Set());
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    permFilterMode === 'ACTIVE'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                  }`}
                >
                  Assigned ({activeCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPermFilterMode('INACTIVE');
                    setSessionToggledIds(new Set());
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    permFilterMode === 'INACTIVE'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                  }`}
                >
                  Revoked ({totalCount - activeCount})
                </button>
              </div>
            </div>

            {/* Module Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedModule('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  selectedModule === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                All Modules
              </button>
              {availableModuleNames.map((mod) => {
                const countInMod = (groupedModules[mod] || []).length;
                const activeInMod = (groupedModules[mod] || []).filter((p) => activePermIds.has(p.id)).length;
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setSelectedModule(mod)}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      selectedModule === mod
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>{mod}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedModule === mod
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400'
                    }`}>
                      {activeInMod}/{countInMod}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Global Batch Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-400 flex-wrap gap-2">
              <div className="font-semibold">
                Showing <strong>{visiblePermissionsCount}</strong> permissions across{' '}
                <strong>{Object.keys(filteredGroupedPermissions).length}</strong> modules
              </div>

              {!isSuperAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                  >
                    Enable Visible
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllVisible}
                    className="text-rose-600 dark:text-rose-400 hover:underline font-bold"
                  >
                    Disable Visible
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleExpandAll}
                    className="text-slate-600 dark:text-zinc-300 hover:underline font-semibold"
                  >
                    Expand All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleCollapseAll}
                    className="text-slate-600 dark:text-zinc-300 hover:underline font-semibold"
                  >
                    Collapse All
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grouped Permissions Accordions */}
          {Object.keys(filteredGroupedPermissions).length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-xs text-slate-400 dark:text-zinc-500 space-y-1">
              <div className="text-sm font-bold text-slate-700 dark:text-zinc-300">No matching permissions</div>
              <div>Try clearing your search query or selecting a different module filter.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(filteredGroupedPermissions).map(([moduleName, perms]) => {
                const isCollapsed = Boolean(collapsedModules[moduleName]);
                const ModuleIcon = getModuleIcon(moduleName);
                const totalInModule = (groupedModules[moduleName] || []).length;
                const activeInModule = (groupedModules[moduleName] || []).filter((p) => activePermIds.has(p.id)).length;
                const allActive = totalInModule > 0 && activeInModule === totalInModule;

                return (
                  <div
                    key={moduleName}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm transition-all"
                  >
                    {/* Accordion Header */}
                    <div className="p-4 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-800/40 border-b border-slate-100 dark:border-zinc-800 select-none">
                      <div
                        onClick={() => toggleModuleAccordion(moduleName)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <ModuleIcon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-black text-slate-900 dark:text-zinc-100">
                              {moduleName} Module
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                              {activeInModule} of {totalInModule} active
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium truncate mt-0.5">
                            Functional entitlements and permission boundaries for {moduleName}
                          </div>
                        </div>
                      </div>

                      {/* Quick Module Controls */}
                      <div className="flex items-center gap-2">
                        {!isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleToggleModule(moduleName, !allActive)}
                            className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-colors ${
                              allActive
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50'
                                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-900/50'
                            }`}
                          >
                            {allActive ? 'Disable Module' : 'Enable All'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleModuleAccordion(moduleName)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <Icons.ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isCollapsed ? '-rotate-90' : 'rotate-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Accordion Body: Clean Responsive Multi-Column Grid */}
                    {!isCollapsed && (
                      <div className="p-3 bg-slate-50/30 dark:bg-zinc-900/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                          {perms.map((perm) => {
                            const isChecked = activePermIds.has(perm.id);

                            return (
                              <div
                                key={perm.id}
                                onClick={() => handleTogglePerm(perm.id)}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all select-none ${
                                  isSuperAdmin
                                    ? 'cursor-not-allowed opacity-75 bg-slate-50/50 dark:bg-zinc-800/30 border-slate-200 dark:border-zinc-800'
                                    : isChecked
                                    ? 'cursor-pointer bg-blue-50/60 dark:bg-blue-950/30 border-blue-400 dark:border-blue-800 shadow-sm'
                                    : 'cursor-pointer bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/60 dark:hover:bg-zinc-800/40'
                                }`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  {/* Toggle Switch */}
                                  <div
                                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors mt-0.5 ${
                                      isChecked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-700'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                        isChecked ? 'translate-x-4.5' : 'translate-x-1'
                                      }`}
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                                      {perm.label || perm.key}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                                      {perm.key}
                                    </div>
                                  </div>
                                </div>

                                <div className="shrink-0 text-right">
                                  <span
                                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${
                                      isChecked
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                                    }`}
                                  >
                                    {isChecked ? 'Active' : 'Revoked (Off)'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}



      {/* 5. Create Custom Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">Create Custom Role</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Define a new role and optionally clone permissions from an existing template.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fleet Safety Inspector"
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Functional Domain
                  </label>
                  <select
                    value={newRoleForm.category}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value="Platform">Platform Admin</option>
                    <option value="Fleet">Fleet Operations</option>
                    <option value="Driver">Driver & Routes</option>
                    <option value="Technician">Hardware & Devices</option>
                    <option value="Advertiser">Advertiser & Media</option>
                    <option value="Government">Government Agency</option>
                    <option value="Finance">Finance & Billing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Clone Permissions From
                  </label>
                  <select
                    value={newRoleForm.cloneFromRoleId}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, cloneFromRoleId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value="">(Blank - No initial perms)</option>
                    {roleList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {formatRoleName(r)} ({(r.permissions || []).length} perms)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline responsibilities and role entitlements..."
                  value={newRoleForm.description}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit Custom Role Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">Edit Role Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  value={editRoleForm.name}
                  onChange={(e) => setEditRoleForm({ ...editRoleForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  value={editRoleForm.category}
                  onChange={(e) => setEditRoleForm({ ...editRoleForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none"
                >
                  <option value="Platform">Platform Admin</option>
                  <option value="Fleet">Fleet Operations</option>
                  <option value="Driver">Driver & Routes</option>
                  <option value="Technician">Hardware & Devices</option>
                  <option value="Advertiser">Advertiser & Media</option>
                  <option value="Government">Government Agency</option>
                  <option value="Finance">Finance & Billing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editRoleForm.description}
                  onChange={(e) => setEditRoleForm({ ...editRoleForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Delete Role Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/80 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
                <Icons.AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">Delete Custom Role?</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Are you sure you want to delete <strong>{formatRoleName(selectedRole)}</strong>? Users currently assigned to this role must be reassigned.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRole}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperRolesPermissionsPage;
