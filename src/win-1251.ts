const stringFromCharCode = String.fromCharCode;

const INDEX_BY_POINTER = new Map([
	[0, '\u0402'],
	[1, '\u0403'],
	[2, '\u201A'],
	[3, '\u0453'],
	[4, '\u201E'],
	[5, '\u2026'],
	[6, '\u2020'],
	[7, '\u2021'],
	[8, '\u20AC'],
	[9, '\u2030'],
	[10, '\u0409'],
	[11, '\u2039'],
	[12, '\u040A'],
	[13, '\u040C'],
	[14, '\u040B'],
	[15, '\u040F'],
	[16, '\u0452'],
	[17, '\u2018'],
	[18, '\u2019'],
	[19, '\u201C'],
	[20, '\u201D'],
	[21, '\u2022'],
	[22, '\u2013'],
	[23, '\u2014'],
	[24, '\x98'],
	[25, '\u2122'],
	[26, '\u0459'],
	[27, '\u203A'],
	[28, '\u045A'],
	[29, '\u045C'],
	[30, '\u045B'],
	[31, '\u045F'],
	[32, '\xA0'],
	[33, '\u040E'],
	[34, '\u045E'],
	[35, '\u0408'],
	[36, '\xA4'],
	[37, '\u0490'],
	[38, '\xA6'],
	[39, '\xA7'],
	[40, '\u0401'],
	[41, '\xA9'],
	[42, '\u0404'],
	[43, '\xAB'],
	[44, '\xAC'],
	[45, '\xAD'],
	[46, '\xAE'],
	[47, '\u0407'],
	[48, '\xB0'],
	[49, '\xB1'],
	[50, '\u0406'],
	[51, '\u0456'],
	[52, '\u0491'],
	[53, '\xB5'],
	[54, '\xB6'],
	[55, '\xB7'],
	[56, '\u0451'],
	[57, '\u2116'],
	[58, '\u0454'],
	[59, '\xBB'],
	[60, '\u0458'],
	[61, '\u0405'],
	[62, '\u0455'],
	[63, '\u0457'],
	[64, '\u0410'],
	[65, '\u0411'],
	[66, '\u0412'],
	[67, '\u0413'],
	[68, '\u0414'],
	[69, '\u0415'],
	[70, '\u0416'],
	[71, '\u0417'],
	[72, '\u0418'],
	[73, '\u0419'],
	[74, '\u041A'],
	[75, '\u041B'],
	[76, '\u041C'],
	[77, '\u041D'],
	[78, '\u041E'],
	[79, '\u041F'],
	[80, '\u0420'],
	[81, '\u0421'],
	[82, '\u0422'],
	[83, '\u0423'],
	[84, '\u0424'],
	[85, '\u0425'],
	[86, '\u0426'],
	[87, '\u0427'],
	[88, '\u0428'],
	[89, '\u0429'],
	[90, '\u042A'],
	[91, '\u042B'],
	[92, '\u042C'],
	[93, '\u042D'],
	[94, '\u042E'],
	[95, '\u042F'],
	[96, '\u0430'],
	[97, '\u0431'],
	[98, '\u0432'],
	[99, '\u0433'],
	[100, '\u0434'],
	[101, '\u0435'],
	[102, '\u0436'],
	[103, '\u0437'],
	[104, '\u0438'],
	[105, '\u0439'],
	[106, '\u043A'],
	[107, '\u043B'],
	[108, '\u043C'],
	[109, '\u043D'],
	[110, '\u043E'],
	[111, '\u043F'],
	[112, '\u0440'],
	[113, '\u0441'],
	[114, '\u0442'],
	[115, '\u0443'],
	[116, '\u0444'],
	[117, '\u0445'],
	[118, '\u0446'],
	[119, '\u0447'],
	[120, '\u0448'],
	[121, '\u0449'],
	[122, '\u044A'],
	[123, '\u044B'],
	[124, '\u044C'],
	[125, '\u044D'],
	[126, '\u044E'],
	[127, '\u044F']
]);

type DecodeOptions = {
  mode: string;
};

// https://encoding.spec.whatwg.org/#error-mode
const decodingError = (mode: DecodeOptions['mode']) => {
	if (mode === 'replacement') {
		return '\uFFFD';
	}
	// Else, `mode == 'fatal'`.
	throw new Error();
};

// https://encoding.spec.whatwg.org/#single-byte-decoder
export const decode = (input: Uint16Array | Uint8Array | Buffer | string, options?: DecodeOptions) => {
	let mode;
	if (options && options.mode) {
		mode = options.mode.toLowerCase();
	}
	// “An error mode […] is either `replacement` (default) or `fatal` for a
	// decoder.”
	if (mode !== 'replacement' && mode !== 'fatal') {
		mode = 'replacement';
	}

	const length = input.length;

	// Support byte strings as input.
	if (typeof input === 'string') {
		const bytes = new Uint16Array(length);
		for (let index = 0; index < length; index++) {
			bytes[index] = input.charCodeAt(index);
		}
		input = bytes;
	}

	const buffer = [];
	for (let index = 0; index < length; index++) {
		const byteValue = input[index];
		// “If `byte` is an ASCII byte, return a code point whose value is
		// `byte`.”
		if (0x00 <= byteValue && byteValue <= 0x7F) {
			buffer.push(stringFromCharCode(byteValue));
			continue;
		}
		// “Let `code point` be the index code point for `byte − 0x80` in index
		// single-byte.”
		const pointer = byteValue - 0x80;
		if (INDEX_BY_POINTER.has(pointer)) {
			// “Return a code point whose value is `code point`.”
			buffer.push(INDEX_BY_POINTER.get(pointer));
		} else {
			// “If `code point` is `null`, return `error`.”
			buffer.push(decodingError(mode));
		}
	}
	const result = buffer.join('');
	return result;
};

export const labels = [
	'cp1251',
	'windows-1251',
	'x-cp1251'
];
