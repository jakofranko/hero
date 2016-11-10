Game.TemplateRepository = new Game.Repository('templates', Game.Template);

// 8x8
Game.TemplateRepository.define('studio apartment', {
	name: 'studio apartment',
	template: [
		'--------',
		'|&O|t#l|',
		'|o +  c|',
		'|---   |',
		'|      |',
		'|     o|',
		'|cTc  {|',
		'|     [|',
		'    +   '
	],
	templateKey: {
		't': {
			repository: 'ItemRepository',
			name: 'end table'
		},
		'#': {
			repository: 'ItemRepository',
			name: 'bed'
		},
		'l': {
			repository: 'ItemRepository',
			name: 'floor lamp'
		},
		'T': {
			repository: 'ItemRepository',
			name: 'table'
		},
		'c': {
			repository: 'ItemRepository',
			name: 'chair'
		},
		'{': {
			repository: 'ItemRepository',
			name: 'oven'
		},
		'[': {
			repository: 'ItemRepository',
			name: 'refridgerator'
		},
		'+': {
			repository: 'TileRepository',
			name: 'door'
		},
		'|': {
			repository: 'TileRepository',
			name: 'indoor wall-vertical'
		},
		'-': {
			repository: 'TileRepository',
			name: 'indoor wall-horizontal'
		},
		'&': {
			repository: 'ItemRepository',
			name: 'toilet'
		},
		'0': {
			repository: 'ItemRepository',
			name: 'bathtub'
		},
		'o': {
			repository: 'ItemRepository',
			name: 'sink'
		},
	}
});

// 12x12
Game.TemplateRepository.define('one-bedroom apartment', {
	name: 'one-bedroom apartment',
	template: [
		'------------',
		'|&Oo|d  t#l|',
		'|   |c     |',
		'|+--|----+-|',
		'|     tcl  |',
		'|  C       |',
		'|V C     cd|',
		'|  C       |',
		'|          |',
		'|         o|',
		'|--   cTc {|',
		'| +       [|',
		'    +       '
	],
	templateKey: {
		't': {
			repository: 'ItemRepository',
			name: 'end table'
		},
		'#': {
			repository: 'ItemRepository',
			name: 'bed'
		},
		'l': {
			repository: 'ItemRepository',
			name: 'floor lamp'
		},
		'd': {
			repository: 'ItemRepository',
			name: 'desk'
		},
		'T': {
			repository: 'ItemRepository',
			name: 'table'
		},
		'c': {
			repository: 'ItemRepository',
			name: 'chair'
		},
		'V': {
			repository: 'ItemRepository',
			name: 'television'
		},
		'{': {
			repository: 'ItemRepository',
			name: 'oven'
		},
		'[': {
			repository: 'ItemRepository',
			name: 'refridgerator'
		},
		'+': {
			repository: 'TileRepository',
			name: 'door'
		},
		'|': {
			repository: 'TileRepository',
			name: 'indoor wall-vertical'
		},
		'-': {
			repository: 'TileRepository',
			name: 'indoor wall-horizontal'
		},
		'&': {
			repository: 'ItemRepository',
			name: 'toilet'
		},
		'0': {
			repository: 'ItemRepository',
			name: 'bathtub'
		},
		'o': {
			repository: 'ItemRepository',
			name: 'sink'
		},
	}
});

// 16x16
Game.TemplateRepository.define('two-bedroom apartment', {
	name: 'two-bedroom apartment',
	template: [
		'----------------',
		'|&  | ld   t#l |',
		'|O  +  c      c|',
		'|o  |         t|',
		'|------------+-|',
		'|t V           |',
		'|c            {|',
		'|lCCC         [|',
		'|  cTc        o|',
		'|      ---+----|',
		'|      + |     |',
		'|      | |&oO  |',
		'|   --+------+-|',
		'|   |t        l|',
		'|   |c t#l   cd|',
		'|   -----------|',
		'  +             '
	],
	templateKey: {
		't': {
			repository: 'ItemRepository',
			name: 'end table'
		},
		'#': {
			repository: 'ItemRepository',
			name: 'bed'
		},
		'l': {
			repository: 'ItemRepository',
			name: 'floor lamp'
		},
		'd': {
			repository: 'ItemRepository',
			name: 'desk'
		},
		'T': {
			repository: 'ItemRepository',
			name: 'table'
		},
		'c': {
			repository: 'ItemRepository',
			name: 'chair'
		},
		'C': {
			repository: 'ItemRepository',
			name: 'couch'
		},
		'V': {
			repository: 'ItemRepository',
			name: 'television'
		},
		'{': {
			repository: 'ItemRepository',
			name: 'oven'
		},
		'[': {
			repository: 'ItemRepository',
			name: 'refridgerator'
		},
		'+': {
			repository: 'TileRepository',
			name: 'door'
		},
		'|': {
			repository: 'TileRepository',
			name: 'indoor wall-vertical'
		},
		'-': {
			repository: 'TileRepository',
			name: 'indoor wall-horizontal'
		},
		'&': {
			repository: 'ItemRepository',
			name: 'toilet'
		},
		'0': {
			repository: 'ItemRepository',
			name: 'bathtub'
		},
		'o': {
			repository: 'ItemRepository',
			name: 'sink'
		},
	}
});