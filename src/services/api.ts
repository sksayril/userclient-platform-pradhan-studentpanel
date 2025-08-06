export const getKycStatus = async (token: string) => {
  try {
    const response = await fetch('http://localhost:3100/api/student/kyc-status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch KYC status.');
    }
    return await response.json();
  } catch (error) {
    console.error('Get KYC Status API error:', error);
    throw error;
  }
};

export const uploadKycData = async (formData: FormData, token: string) => {
  try {
    const response = await fetch('http://localhost:3100/api/student/kyc-upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong during KYC upload.');
    }
    return await response.json();
  } catch (error) {
    console.error('KYC Upload API error:', error);
    throw error;
  }
};

export const loginUser = async (credentials: any) => {
  try {
    const response = await fetch('http://localhost:3100/api/student/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong during login.');
    }

    return await response.json();
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

export const signupUser = async (formData: any) => {
  try {
    const response = await fetch('http://localhost:3100/api/student/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong during signup.');
    }

    return await response.json();
  } catch (error) {
    console.error('Signup API error:', error);
    throw error;
  }
};
