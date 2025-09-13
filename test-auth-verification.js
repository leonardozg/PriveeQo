#!/usr/bin/env node

// Complete authentication testing script for PRIVEE
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testAdminAuth() {
    console.log('🔐 TESTING ADMIN AUTHENTICATION');
    
    try {
        const response = await fetch(`${BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'Admin2025!'
            })
        });
        
        const data = await response.json();
        console.log('✅ Admin Login Response:', data);
        
        // Extract cookies
        const cookies = response.headers.get('set-cookie');
        console.log('🍪 Admin Cookies:', cookies);
        
        if (response.ok && data.id) {
            return cookies;
        } else {
            console.log('❌ Admin login failed');
            return null;
        }
    } catch (error) {
        console.error('❌ Admin auth error:', error.message);
        return null;
    }
}

async function testPartnerAuth(username, password) {
    console.log(`\n🔐 TESTING PARTNER: ${username}`);
    
    try {
        const response = await fetch(`${BASE_URL}/api/partner/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password
            })
        });
        
        const data = await response.json();
        console.log(`📊 Partner ${username} Response:`, data);
        
        if (response.ok && data.id) {
            const cookies = response.headers.get('set-cookie');
            console.log(`🍪 ${username} Cookies:`, cookies);
            
            // Test /me endpoint
            const meResponse = await fetch(`${BASE_URL}/api/partner/me`, {
                headers: {
                    'Cookie': cookies || ''
                }
            });
            
            if (meResponse.ok) {
                const meData = await meResponse.json();
                console.log(`✅ ${username} Profile:`, meData);
                return true;
            } else {
                console.log(`❌ ${username} /me failed`);
                return false;
            }
        } else {
            console.log(`❌ ${username} login failed`);
            return false;
        }
    } catch (error) {
        console.error(`❌ ${username} error:`, error.message);
        return false;
    }
}

async function getPartnersList(adminCookies) {
    console.log('\n📋 GETTING PARTNERS LIST');
    
    try {
        const response = await fetch(`${BASE_URL}/api/admin/partners`, {
            headers: {
                'Cookie': adminCookies || ''
            }
        });
        
        if (response.ok) {
            const partners = await response.json();
            console.log('📊 Available Partners:', JSON.stringify(partners, null, 2));
            return partners;
        } else {
            const text = await response.text();
            console.log('❌ Partners list failed, response:', text.substring(0, 200));
            return [];
        }
    } catch (error) {
        console.error('❌ Partners list error:', error.message);
        return [];
    }
}

async function runAuthTests() {
    console.log('🚀 STARTING COMPREHENSIVE AUTHENTICATION TESTING\n');
    
    // Test admin
    const adminCookies = await testAdminAuth();
    
    if (adminCookies) {
        // Get partners list
        const partners = await getPartnersList(adminCookies);
        
        if (Array.isArray(partners) && partners.length > 0) {
            console.log(`\n📋 Found ${partners.length} partners in database`);
            
            // Test each partner
            for (const partner of partners.slice(0, 3)) { // Test first 3
                await testPartnerAuth(partner.username, 'default_password_to_test');
            }
        }
    }
    
    // Test known partners
    console.log('\n🧪 TESTING KNOWN PARTNER CREDENTIALS');
    const knownPartners = [
        { username: 'Alonso1', password: 'socio123' },
        { username: 'Maria2', password: 'socio456' },
        { username: 'Carlos3', password: 'premium789' }
    ];
    
    let successCount = 0;
    for (const partner of knownPartners) {
        const success = await testPartnerAuth(partner.username, partner.password);
        if (success) successCount++;
    }
    
    console.log(`\n📊 AUTHENTICATION TEST SUMMARY:`);
    console.log(`✅ Admin: ${adminCookies ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Partners: ${successCount}/${knownPartners.length} successful`);
    
    if (adminCookies && successCount > 0) {
        console.log('\n🎉 AUTHENTICATION SYSTEM IS WORKING!');
    } else {
        console.log('\n⚠️  AUTHENTICATION ISSUES DETECTED');
    }
}

runAuthTests().catch(console.error);