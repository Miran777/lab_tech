function serialize(numbers) {
    if (!numbers || numbers.length === 0) {
        return "";
    }
    
    const sortedUnique = [...new Set(numbers)].sort((a, b) => a - b);
    
    const deltas = [];
    let prev = 0;
    for (const num of sortedUnique) {
        deltas.push(num - prev);
        prev = num;
    }
    
    const encodedBytes = [];
    for (const delta of deltas) {
        let value = delta;
        const bytes = [];
        
        do {
            let byte = value & 0x7F;
            value = Math.floor(value / 128);
            if (value > 0) {
                byte |= 0x80;
            }
            bytes.push(byte);
        } while (value > 0);
        
        encodedBytes.push(...bytes.reverse());
    }
    
    return String.fromCharCode(...encodedBytes);
}

function deserialize(compressedStr) {
    if (!compressedStr || compressedStr.length === 0) {
        return [];
    }
    
    const bytes = [];
    for (let i = 0; i < compressedStr.length; i++) {
        bytes.push(compressedStr.charCodeAt(i));
    }
    
    const deltas = [];
    let currentValue = 0;
    let shift = 0;
    
    for (const byte of bytes) {
        currentValue |= (byte & 0x7F) << shift;
        
        if ((byte & 0x80) === 0) {
            deltas.push(currentValue);
            currentValue = 0;
            shift = 0;
        } else {
            shift += 7;
        }
    }
    
    const numbers = [];
    let total = 0;
    
    for (const delta of deltas) {
        total += delta;
        numbers.push(total);
    }
    
    return numbers;
}

// Эта функция для сравнения чтобы можно было сравнить эффективность до перевода в другой формат
function simpleSerialize(numbers) {
    if (!numbers || numbers.length === 0) {
        return "";
    }
    return [...new Set(numbers)].sort((a, b) => a - b).join(',');
}

function compressionRatio(original, compressed) {
    if (!original || original.length === 0) {
        return 0;
    }
    return compressed.length / original.length;
}

function generateRandomNumbers(count) {
    const numbers = new Set();
    while (numbers.size < count) {
        numbers.add(Math.floor(Math.random() * 300) + 1);
    }
    return Array.from(numbers);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        serialize,
        deserialize,
        simpleSerialize,
        compressionRatio,
        generateRandomNumbers
    };
}

if (typeof window !== 'undefined') {
    window.numberCompressor = {
        serialize,
        deserialize,
        simpleSerialize,
        compressionRatio,
        generateRandomNumbers
    };
}