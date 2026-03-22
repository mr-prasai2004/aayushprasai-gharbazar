// Quick account setup utility for testing
// This file helps with creating test accounts during development

export const TEST_ACCOUNTS = {
  ADMIN: {
    email: 'admin@ghar-bazar.com',
    role: 'admin',
    loginTime: new Date().toISOString(),
  },
  SELLER: {
    email: 'seller@ghar-bazar.com',
    role: 'seller',
    loginTime: new Date().toISOString(),
  },
  BUYER: {
    email: 'buyer@ghar-bazar.com',
    role: 'buyer',
    loginTime: new Date().toISOString(),
  },
};

/**
 * Quickly login as a test user
 * Usage: loginAsTestUser('ADMIN') or loginAsTestUser('SELLER')
 */
export const loginAsTestUser = (accountType: keyof typeof TEST_ACCOUNTS, redirectPath?: string) => {
  const account = TEST_ACCOUNTS[accountType];
  if (!account) {
    console.error(`Account type ${accountType} not found`);
    return;
  }

  localStorage.setItem('currentUser', JSON.stringify(account));
  console.log(`✅ Logged in as ${accountType}:`, account.email);

  // Navigate to appropriate dashboard
  const defaultPaths = {
    ADMIN: '/dashboard/admin',
    SELLER: '/dashboard/seller',
    BUYER: '/dashboard/buyer',
  };

  const path = redirectPath || defaultPaths[accountType];
  window.location.href = path;
};

/**
 * View all test data in localStorage
 */
export const viewTestData = () => {
  console.log('=== Current User ===');
  console.log(JSON.parse(localStorage.getItem('currentUser') || '{}'));

  console.log('\n=== Pending Properties ===');
  console.log(JSON.parse(localStorage.getItem('pending_properties') || '[]'));

  console.log('\n=== Notifications ===');
  console.log(JSON.parse(localStorage.getItem('notifications') || '[]'));

  console.log('\n=== Approved Properties ===');
  console.log(JSON.parse(localStorage.getItem('approved_properties') || '[]'));
};

/**
 * Clear all test data
 */
export const clearAllTestData = () => {
  localStorage.clear();
  console.log('✅ All test data cleared');
};

/**
 * Get test data summary
 */
export const getTestDataSummary = () => {
  const pendingProps = JSON.parse(localStorage.getItem('pending_properties') || '[]');
  const approvedProps = JSON.parse(localStorage.getItem('approved_properties') || '[]');
  const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  return {
    currentUser: currentUser.email || 'Not logged in',
    pendingProperties: pendingProps.length,
    approvedProperties: approvedProps.length,
    notifications: notifications.length,
    unreadNotifications: notifications.filter((n: any) => !n.read).length,
  };
};

// Make available in window for console access during development
if (typeof window !== 'undefined') {
  (window as any).TestUtils = {
    loginAsTestUser,
    viewTestData,
    clearAllTestData,
    getTestDataSummary,
    TEST_ACCOUNTS,
  };
  console.log('✅ TestUtils available in console: TestUtils.loginAsTestUser("ADMIN")');
}
