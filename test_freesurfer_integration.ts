/**
 * Test script to verify FreeSurfer integration
 */

import { runFreeSurferAnalysis, getFreeSurferSubjectStatus, collectFreeSurferStats } from './src/lib/pythonService'

async function testFreeSurferIntegration() {
  console.log('Testing FreeSurfer integration...')
  
  try {
    // Test health check
    console.log('1. Testing Python service health check...')
    const isAvailable = await fetch('http://localhost:8001/health')
      .then(res => res.json())
      .then(data => data.status === 'healthy')
      .catch(() => false)
    
    console.log(`   Python service available: ${isAvailable}`)
    
    if (!isAvailable) {
      console.log('   ❌ Python service is not available. Skipping further tests.')
      return
    }
    
    // Test subject status check (with a mock subject ID)
    console.log('2. Testing subject status check...')
    try {
      const status = await getFreeSurferSubjectStatus('test_subject_001')
      console.log('   ✅ Subject status check successful')
      console.log(`   Status: ${JSON.stringify(status)}`)
    } catch (error) {
      console.log('   ⚠️  Subject status check failed (expected if subject does not exist)')
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    console.log('FreeSurfer integration test completed.')
    
  } catch (error) {
    console.error('Error during integration test:', error)
  }
}

// Run the test
testFreeSurferIntegration()