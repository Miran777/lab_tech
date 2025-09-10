const {
    serialize,
    deserialize,
    simpleSerialize,
    compressionRatio,
    generateRandomNumbers
} = require('./script.js');

function createTestData() {
    return {
        "short1": [1, 2, 3, 4, 5],
        "short2": [1, 300, 237, 188, 225],
        "short3": [10, 20, 30],
        
        "random5": generateRandomNumbers(5),
        "random550": generateRandomNumbers(50),
        "random5100": generateRandomNumbers(100),
        "random5500": generateRandomNumbers(500),
        "random51000": generateRandomNumbers(1000),
        
        "1-digit": Array.from({length: 9}, (_, i) => i + 1),
        "2-digit": Array.from({length: 90}, (_, i) => i + 10),
        "3-digit": Array.from({length: 201}, (_, i) => i + 100),
        
        "3 of each (900)": (() => {
            const result = [];
            for (let i = 1; i <= 300; i++) {
                result.push(i, i, i);
            }
            return result;
        })(),
        
        "tight range": Array.from({length: 100}, (_, i) => i + 1),
        "sparse range": Array.from({length: 30}, (_, i) => i * 10 + 1),
        "only one number": [42],
        "empty array": []
    };
}

function testSerialization(testName, numbers) {
    console.log(`${testName}:`);
    
    if (numbers.length === 0) {
        console.log("  empty array - skip");
        return 0;
    }
    
    const simple = simpleSerialize(numbers);
    const compressed = serialize(numbers);
    const restored = deserialize(compressed);
    
    const originalSorted = [...new Set(numbers)].sort((a, b) => a - b);
    const restoredSorted = restored.sort((a, b) => a - b);
    
    if (JSON.stringify(originalSorted) !== JSON.stringify(restoredSorted)) {
        console.error(`Data recovery error`);
        console.log(`Original: ${originalSorted}`);
        console.log(`Restored: ${restoredSorted}`);
        return 0;
    }
    
    const ratio = compressionRatio(simple, compressed);
    const improvement = (1 / ratio).toFixed(1);
    
    console.log(`  Numbers: ${new Set(numbers).size} unique from ${numbers.length}`);
    console.log(`  Simple: ${simple.length} symbols`);
    console.log(`  Compressed: ${compressed.length} symbols`);
    console.log(`  Coefficient: ${ratio.toFixed(3)}`);
    console.log(`  Improvement: ${improvement}x`);
    
    if (numbers.length <= 10) {
        console.log(`  Example: [${numbers.slice(0, 5).join(', ')}${numbers.length > 5 ? '...' : ''}]`);
        console.log(`  Compressed line: "${compressed}"`);
    }
    
    return ratio;
}

function runAllTests() {
    const tests = createTestData();
    let totalRatio = 0;
    let testCount = 0;
    const results = [];
    
    console.log("TESTING THE COMPRESSION ALGORITHM");
    
    for (const [testName, numbers] of Object.entries(tests)) {
        const ratio = testSerialization(testName, numbers);
        if (ratio > 0) {
            totalRatio += ratio;
            testCount++;
            results.push({ testName, ratio, improvement: (1 / ratio).toFixed(1) });
        }
    }
    
    console.log(`TEST RESULTS`);
    console.log(`Total tests: ${testCount}`);
    console.log(`Average compression ratio: ${(totalRatio / testCount).toFixed(3)}`);
    console.log(`Average improvement: ${(testCount / totalRatio).toFixed(1)}x`);
    
    results.sort((a, b) => a.ratio - b.ratio);
    
    console.log(`Best compression: ${results[0].testName} - ${results[0].ratio.toFixed(3)} (${results[0].improvement}x)`);
    console.log(`Worst compression: ${results[results.length - 1].testName} - ${results[results.length - 1].ratio.toFixed(3)} (${results[results.length - 1].improvement}x)`);
    
    return results;
}

function demonstrate() {
    console.log("DEMONSTRATION OF WORK");
    
    const examples = [
        { name: "Prime numbers", data: [1, 2, 3, 4, 5] },
        { name: "Mixed meanings", data: [1, 300, 237, 188, 225] },
        { name: "Tens", data: [10, 20, 30, 40, 50] },
        { name: "Big numbers", data: [100, 200, 300] }
    ];
    
    examples.forEach((example, i) => {
        console.log(`${i + 1}. ${example.name}: [${example.data.join(', ')}]`);
        
        const compressed = serialize(example.data);
        const restored = deserialize(compressed);
        const simple = simpleSerialize(example.data);
        const ratio = compressionRatio(simple, compressed);
        
        console.log(`   Simple: "${simple}" (${simple.length} chars)`);
        console.log(`   Compressed: "${compressed}" (${compressed.length} chars)`);
        console.log(`   Coefficient: ${ratio.toFixed(3)} (${(1/ratio).toFixed(1)}x improvement)`);
        console.log(`   Restored: [${restored.join(', ')}]`);
    });
}

function quickTest() {
    console.log("QUICK CHECK");
    
    const testNumbers = [1, 2, 3, 10, 11, 12, 100, 150, 200, 300];
    console.log("Original numbers:", testNumbers);
    
    const compressed = serialize(testNumbers);
    const restored = deserialize(compressed);
    const simple = simpleSerialize(testNumbers);
    const ratio = compressionRatio(simple, compressed);
    
    console.log("Compressed line:", compressed);
    console.log("Length of compressed:", compressed.length, "symbols");
    console.log("Simple serialization:", simple);
    console.log("Length of simple:", simple.length, "symbols");
    console.log("Compression ratio:", ratio.toFixed(3));
    console.log("Improvement:", (1/ratio).toFixed(1) + "x");
    console.log("Restored:", restored);
    console.log("Correctness:", JSON.stringify([...new Set(testNumbers)].sort((a, b) => a - b)) === 
                 JSON.stringify(restored.sort((a, b) => a - b)) ? "OK" : "ERROR");
}

module.exports = {
    testSerialization,
    runAllTests,
    demonstrate,
    quickTest,
    createTestData
};

if (require.main === module) {
    console.log("Running number compression tests...");
    
    demonstrate();
    
    quickTest();
    
    setTimeout(() => {
        console.log(" =".repeat(50));
        runAllTests();
    }, 1000);
}