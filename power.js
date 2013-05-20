if (typeof $WowheadPower == "undefined") {
	var $WowheadPower = new
	function() {
		function t(AS, AR) {
			var AQ = document.createElement(AS);
			if (AR) {
				AK(AQ, AR)
			}
			return AQ
		}
		function O(AQ, AR) {
			return AQ.appendChild(AR)
		}
		function s(AR, AS, AQ) {
			if (window.attachEvent) {
				AR.attachEvent("on" + AS, AQ)
			} else {
				AR.addEventListener(AS, AQ, false)
			}
		}
		function AK(AS, AQ) {
			for (var AR in AQ) {
				if (typeof AQ[AR] == "object") {
					if (!AS[AR]) {
						AS[AR] = {}
					}
					AK(AS[AR], AQ[AR])
				} else {
					AS[AR] = AQ[AR]
				}
			}
		}
		function l(AQ) {
			if (!AQ) {
				AQ = event
			}
			if (!AQ._button) {
				AQ._button = AQ.which ? AQ.which: AQ.button;
				AQ._target = AQ.target ? AQ.target: AQ.srcElement
			}
			return AQ
		}
		function AB() {
			var AR = 0,
			AQ = 0;
			if (typeof window.innerWidth == "number") {
				AR = window.innerWidth;
				AQ = window.innerHeight
			} else {
				if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
					AR = document.documentElement.clientWidth;
					AQ = document.documentElement.clientHeight
				} else {
					if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
						AR = document.body.clientWidth;
						AQ = document.body.clientHeight
					}
				}
			}
			return {
				w: AR,
				h: AQ
			}
		}
		function b() {
			var AQ = 0,
			AR = 0;
			if (typeof(window.pageYOffset) == "number") {
				AQ = window.pageXOffset;
				AR = window.pageYOffset
			} else {
				if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
					AQ = document.body.scrollLeft;
					AR = document.body.scrollTop
				} else {
					if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
						AQ = document.documentElement.scrollLeft;
						AR = document.documentElement.scrollTop
					}
				}
			}
			return {
				x: AQ,
				y: AR
			}
		}
		function AH(AS) {
			var AR, AT;
			if (window.innerHeight) {
				AR = AS.pageX;
				AT = AS.pageY
			} else {
				var AQ = b();
				AR = AS.clientX + AQ.x;
				AT = AS.clientY + AQ.y
			}
			return {
				x: AR,
				y: AT
			}
		}
		function c(AR) {
			var AQ = c.L;
			return (AQ[AR] ? AQ[AR] : 0)
		}
		c.L = {
			fr: 2,
			de: 3,
			es: 6,
			ru: 7,
			wotlk: 0,
			ptr: 0
		};
		function AF(AQ) {
			var AR = AF.L;
			return (AR[AQ] ? AR[AQ] : -1)
		}
		AF.L = {
			npc: 1,
			object: 2,
			item: 3,
			itemset: 4,
			quest: 5,
			spell: 6,
			zone: 7,
			faction: 8,
			pet: 9,
			achievement: 10,
			seller: 99,
			transmogset: 101,
			'transmog-set': 101
		};
		function o(AV, AR, AU) {
			var AT = {
				12 : 1.5,
				13 : 13.8,
				14 : 13.8,
				15 : 5,
				16 : 10,
				17 : 10,
				18 : 8,
				19 : 14,
				20 : 14,
				21 : 14,
				22 : 10,
				23 : 10,
				24 : 0,
				25 : 0,
				26 : 0,
				27 : 0,
				28 : 10,
				29 : 10,
				30 : 10,
				31 : 10,
				32 : 14,
				33 : 0,
				34 : 0,
				35 : 28.75,
				36 : 10,
				37 : 2.5,
				44 : 4.69512176513672
			};
			if (AV < 0) {
				AV = 1
			} else {
				if (AV > 80) {
					AV = 80
				}
			}
			if ((AR == 14 || AR == 12 || AR == 15) && AV < 34) {
				AV = 34
			}
			if (AU < 0) {
				AU = 0
			}
			var AS;
			if (AT[AR] == null) {
				AS = 0
			} else {
				var AQ;
				if (AV > 70) {
					AQ = (82 / 52) * Math.pow((131 / 63), ((AV - 70) / 10))
				} else {
					if (AV > 60) {
						AQ = (82 / (262 - 3 * AV))
					} else {
						if (AV > 10) {
							AQ = ((AV - 8) / 52)
						} else {
							AQ = 2 / 52
						}
					}
				}
				AS = AU / AT[AR] / AQ
			}
			return AS
		}
		var a = {
			applyto: 3
		},
		J,
		y,
		AG,
		r,
		W,
		w,
		u,
		R = document.getElementsByTagName("head")[0],
		e = {},
		Z = {},
		K = {},
		AO = {},
		sellerstruct = {},
		transmogstruct = {},
		factionstruct = {},
		x,
		Y,
		C,
		f, qdiv,
		AI,
		F = 1,
		n = 0,
		z = !!(window.attachEvent && !window.opera),
		T = navigator.userAgent.indexOf("MSIE 7.0") != -1,
		V = navigator.userAgent.indexOf("MSIE 6.0") != -1 && !T,
		i = {
			loading: "Loading...&nbsp;<span id=\"whloadspan\"></span>",
			noresponse: "No response from server :("
		},
		AD = 0,
		N = 1,
		L = 2,
		q = 3,
		AC = 4,
		h = 3,
		p = 5,
		X = 6,
		AA = 10,
		Q = 15,
		k = 15,
		S = {
			3 : [e, "item", "Item"],
			5 : [Z, "quest", "Quest"],
			6 : [K, "spell", "Spell"],
			8 : [factionstruct, "faction", "Faction"],
			10 : [AO, "achievement", "Achievement"],
			99 : [sellerstruct, "seller", "Seller"],
			101 : [transmogstruct, "transmog-set", "Transmog Set"]
		},
		H = {
			0 : "enus",
			2 : "frfr",
			3 : "dede",
			6 : "eses",
			7 : "ruru",
			25 : "ptr"
		};
		function AM() {
			// .wowhead-tooltip-powered{background:url(images/power/powered.png) no-repeat;width:53px;height:33px;position:absolute;right:-56px;top:2px;}
			var power_css = ".wowhead-tooltip{position:absolute;left:0;top:0;z-index:100000001;}.wowhead-tooltip a{text-decoration: none}.wowhead-tooltip table{border-spacing:0;border-collapse:collapse;margin:0;}.wowhead-tooltip table,.wowhead-tooltip td,.wowhead-tooltip th,.wowhead-tooltip tbody{border:0!important;}.wowhead-tooltip tr{background:transparent!important;border:0!important;}.wowhead-tooltip td,.wowhead-tooltip th{background:transparent url(images/power/tooltip.png);font-family:Verdana,sans-serif;font-size:12px;line-height:17px;color:white;}.wowhead-tooltip th{padding:3px;border:0;height:auto;vertical-align:top;}.wowhead-tooltip td{padding:8px 4px 1px 9px;text-align:left;vertical-align:top;}.wowhead-tooltip b{font-size:14px;line-height:19px;font-weight:normal;}.wowhead-tooltip div.indent{padding-left:.6em;}.wowhead-tooltip td th,.wowhead-tooltip td td{background:none;}.wowhead-tooltip td th{padding:0 0 0 4em;text-align:right;font-weight:normal;}.wowhead-tooltip td td{padding:0;text-align:left;}.wowhead-tooltip p{position:absolute;left:-44px;top:-1px;width:44px;height:44px;background:4px 4px no-repeat;margin:0;padding:0;}.wowhead-tooltip p div{width:44px;height:44px;background-image:url(images/power/icon_border_medium.png);}.socket-meta{padding-left:20px;background:url(images/power/socket_meta.gif) no-repeat 2px center}.socket-red{padding-left:20px;background:url(images/power/socket_red.gif) no-repeat 2px center}.socket-yellow{padding-left:20px;background:url(images/power/socket_yellow.gif) no-repeat 2px center}.socket-blue{padding-left:20px;background:url(images/power/socket_blue.gif) no-repeat 2px center}.socket-prismatic{padding-left:20px;background:url(images/power/socket_prismatic.gif) no-repeat 2px center}.q{color:#ffd100!important;}.q0,.q0 a{color:#9d9d9d!important;}.q1,.q1 a{color:#fff!important;}.q2,.q2 a{color:#1eff00!important;}.q3,.q3 a{color:#0070dd!important;}.q4,.q4 a{color:#a335ee!important;}.q5,.q5 a{color:#ff8000!important;}.q6,.q6 a{color:#e5cc80!important;}.q7,.q7 a{color:#e5cc80!important;}.q8,.q8 a{color:#ffff98!important;}.q9,.q9 a{color:#71d5ff!important;}.q10,.q10 a{color:#f00!important;}.r1{color:#FF8040!important;}.r2{color:#FF0!important;}.r3{color:#40BF40!important;}.r4{color:#808080!important;}.c1,.c1 a{color:#C69B6D!important;}.c2,.c2 a{color:#F48CBA!important;}.c3,.c3 a{color:#AAD372!important;}.c4,.c4 a{color:#FFF468!important;}.c5,.c5 a{color:#FFF!important;}.c6,.c6 a{color:#C41E3B!important;}.c7,.c7 a{color:#2359FF!important;}.c8,.c8 a{color:#68CCEF!important;}.c9,.c9 a{color:#9382C9!important;}.c11,.c11 a{color:#FF7C0A!important;}.moneygold,.moneysilver,.moneycopper{padding-right:15px;color:white;background:no-repeat right center;}.moneygold{background-image:url(images/power/money_gold.gif);}.moneysilver{background-image:url(images/power/money_silver.gif);}.moneycopper{background-image:url(images/power/money_copper.gif);}";
			var power_ie6_css = ".wowhead-tooltip td,.wowhead-tooltip th{background-image:url(images/power/tooltip.gif);}.wowhead-tooltip p div{background:none;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='images/power/icon_border_medium.png');}.wowhead-tooltip-powered{background:none;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='images/power/powered.png');}";
			var power_ie_css = ".wowhead-tooltip th{height:8px;}";

			var icon_border_medium = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKiSURBVHja7Jk9aBRBFMffXE7NxWVzEUKaSNCLQW03RToRgoT0dhY5CwutFSWdIIiFH52tpSDB6ogiSJRgimwfYsCExMIqd+fJRdGM78290bnJ3pEcZm9W9sFjdnd2Z347+39zc2+ElBLIhBA+FgPoOYg2CfFbHX0bGb/qC1kD9hQDn+C63TYNyQ5eqJMXrqDnke+ThhboBHuaKtDPoxfBHdtCf8jgCpqARxj4HPrVsbFCcGP2JnxeXY9soe9Iryqr1Sr4vq9KbeY5Hev7zDqz9Dzvb7u9x8DP59Xxzs53mJt7AaXSfIinmwxdRl8XDEp+xxscGr9+rQiL7xdg8d2HsEu6VV++eOVyMDhSgAf37pvQG03AT549HX/1/KX5ZitdAj6LfvLW7O2AThB6GYu76KtZcxQt2DesoVrMsB73O4mgMD09FZiV2RbRvMIPLaHQv8SqBSGGsJhghmG7PtPm2VrcsGq0Gn22/KpNwJVaBRw3mTEn9eM9R10HhibgbC6XGGBlP+v1ZAG7aHZcNQG7KIl+rz9ZI2zL1Hlg+6unQZcGXdKCLnGSSNzip+20ZuslXUv863k4Xa0dNvC3Xz8SE3QZV/9x/F8aToCJ9JcujqATLv/StQ26VBKHDWxJwuPEXLzTQKNPL0LDSrpR2UuqoPwsZS8nsIFupFuHmUHs0bR9gfKxpdI8HU5ClxPaly5eCKKA/7zF2tpHGB09AwFaGFJee29+Ni5l0MCRHF6/XQj5a9MeR11vyhSgsW1QtDPeFIikbV2awanXHjT12Pdp7em6qHWKrms1rRq7AY/A2JTxGXiAoWccmhRoZB+jbxOslLIqaCeUNxY1dL7Fw7v77OQgG4yCz+1S15VNWHUxYuu27wCd7/eeTo10VdawZL8FGACwQwwDuAOrkQAAAABJRU5ErkJggg==";
			var socket_blue = "data:image/gif;base64,R0lGODlhDgAOANUAAAgUKBAcOBAYMAgYMBAkSAgUIDhAeCAyZBguXRgtXThQqBo2bRgkYBAhQhggUBAYKBImTSAsaEBQoCw8dCA8eGBs2Kio+DBMoFBkwHiCsCQ0bCw6eFBgyIiOrCw8iChQqCVJkh05ctDY+Pj4+FBg4DBcuGBkpJieuPj8+Cg0aChMmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAOAA4AAAaLQJPDMcEYK8iAYemwWCaAaGCqRBmaDgAUQFWeDIfHY7EgEKLo6OVwIIMIkFCasx6bS4AQBALY0MUEIGUqAHxRGwoCAgAUFA0fCVMDAySJAg0NFAgBkAGTHpYIAAibAQkJnxoalwgNCKeSkxEZIoqKBQUHBQwdDLMiEra4uB0jDBkRESkSzArOBwzRQQA7";
			var socket_meta = "data:image/gif;base64,R0lGODlhDgAOAMQAADAwMBgYGBAQECgoKCAgIFhYWFRUVEhISJCQkNDQ0GxsbD09PVBQUJiYmDo6OkBAQHR0dC0tLWRkZKCgoMjIyGBgYKioqIiIiNjY2GhoaMDAwAAAAHh4eICAgHx8fAAAACH5BAAAAAAALAAAAAAOAA4AAAWFoAcARGFKKKGsAEUVBIJYFqFiSkvCs01suIHwMAIEjgCBEjI8VEaHo7IA0QyIAE4AK5hQq4AKsRIwTrymBuFwiGQWQgSDUWgECJGDY/AeCOQFRw54ewNwDAIMAYEEDhEOC3B+Sg8JCUcBCA1KAgAJAA8XCQaZBg2bApYAFw8PBq+wryMdIQA7";
			var socket_prismatic = "data:image/gif;base64,R0lGODlhDgAOANUAADg8OEBEQEhISFBQUEBAQEA8QGBkYJCQkDg4OIiMiGBiYISGhFhaWODk4HBwcFBUUFRWVKisqGhsaOjo6IiIiGhwaLC0sOjs6GRmZHiAeHBycHR2dKSmpKioqJiamJicmGhqaCAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAOAA4AAAaDwM/jQYgYLcjAYvloNDaEaGCqvCyaRCiBGghZFQCAY0AumAthAEWhcLgHkIo53FkDyINDoQKBADR1YQNvchBofwdTAhISAhkGAgJhB4kBkRIMjpCTlZkMmQKQGACJIJaeBpCSYQYTE1FRCAgKCAMNAwYcEwmwsrJOAxypGAnFxgpkHkEAOw==";
			var socket_red = "data:image/gif;base64,R0lGODlhDgAOANUAACgMEDgQECgICDAUGCAIEEgUGDAQEF0YHUISGCgIEG0dJWgwKLA8OCgQEF0ZIJQ8PFAUEFAYGGgkIGQgJE0VGvC8qKAwOKg0ONhwYPi4oOjIuHQ0MMBgUHggKPjYyJImMshYUKh2bHgwLGQeJKgoOHIeJbCEeKBoXLgwQKRoXHAoKGwkJJgoMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAOAA4AAAaOwFQksuEYMcjAYmGKZDKbhDRAVXoWzkgimqhaF5NGQ6EoFABogGBtmUzInwKlhF6D2mMzClCiUAQid2IFH2UsABRqgAwDAwAdHQgkB1RoDIwDCAgdDgGTAZaYDgAInQEHBysAjCqZDqWolWgSGhoGtwYEBCMEEBUQEiEaD7i6uhW/IRISD80PF9AjEBAnQQA7";
			var socket_yellow = "data:image/gif;base64,R0lGODlhDgAOANUAADAoECAYCF1KGDgoECgkCCAcCDgwEEg4EDAkEEI1EGRUIG1WGtDQkCggEFBEEHx0TEA4EE1AEvD4qMjAUODkmHh0SHhgIPD0oLCUOLioQKCIMKiYQKiYMKiQONjMYHxyMGxgKJiWWCggCJJ1JWRYHKiAKHJcHaCeXBgEAHBeJLiUMCAYAJh4KGxiJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAOAA4AAAaPwBAkhJgYPcjB40GBXC4fhHRAVVIeTggiiqgOUFdFo7FYHA6ENKHA1igU5dEhYkqzM27yWUUwRSIFLXhjByNmLAQRawUZGAAAIhYWCSUCBgYBARyOAAkJFpaVmJqcAiIJlgYCAiSaACmdAqirlwGtFQwMj4+ZCgEOEg4ruSC7mZkSwQwVFSAbzx3RCg4OJ0EAOw==";
			var tooltip_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArwAAAK8CAYAAAANumxDAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAx2SURBVHja7N0xattQGMBxPZNBkMHavYc6U4Nv0KGUnqJTfYqAIadwoOALeA2mi09g3KmG7NmVIeChoL6nREbJHsgTvx98CMmevumPeKDQNE2RhBDO4+UizrgAAIB8Pca5j537lG7O3sTuLM7EjgAAyNjDS+O20Xv2Nna32+0i/aGqKqsCACAbZVm21+l0uuiepegN8XrVxe7hcFis1+vi+ubXzsoAAMjN3z93s170pje9u1HxfGZ3st/vxS4AAFm7/Py9bdn0Ird4Pqo7HnU/bjYbsQsAwCCid7Vane5HVgIAwJAJXgAABC8AAAheAAD4yMFb17VtAAAwyOBNX1srrQIAgKEG7784R6sAAGCowQsAAIIXAAAELwAACF4AABC8AAAgeAEAQPACACB4AQBA8AIAgOAFAADBCwAAghcAAAQvAAAIXgAABC8AAAheAAAQvAAAIHgBAEDwAgCA4AUAAMELAIDgBQAAwQsAAIIXAAAELwAACF4AABC8AAAgeAEAELwAACB4AQBA8AIAgOAFAADBCwAAghcAAAQvAACCFwAABC8AAAheAAAQvAAAIHgBAEDwAgCA4AUAQPACAIDgBQAAwQsAAIIXAAAELwAACF4AABC8AAAIXgAAELwAACB4AQBA8AIAgOAFAADBCwAAghcAAMELAACCFwAABC8AAAheAAAQvAAAIHgBAEDwAgAgeAEAQPACAIDgBQAAwQsAAIIXAAAELwAACF4AAAQvAAAIXgAAELwAACB4AQBA8AIAgOAFAADBCwCA4AUAAMELAACCFwAABC8AAAheAAAQvAAAIHgBABC8AAAgeAEAQPACAIDgBQAAwQsAAIIXAAAELwAAghcAAAQvAAAIXgAAELwAACB4AQBA8AIAgOAFAEDwAgCA4AUAAMELAACCFwAABC8AAAheAAAQvAAACF4AABC8AAAgeAEAQPACAIDgBQAAwQsAAIIXAADBCwAAghcAAAQvAAAIXgAAELwAACB4AQBA8AIAIHgBAEDwAgCA4AUAAMELAACCFwAABC8AAAheAAAELwAACF4AABC8AAAgeAEAQPACAIDgBQAAwQsAgOAFAADBCwAAghcAAAQvAAAIXgAAELwAACB4AQAQvAAAIHgBAEDwAgCA4AUAAMELAACCFwAABC8AAIIXAAAELwAACF4AABC8AAAgeAEAQPACAIDgBQBA8AIAgOAFAADBCwAAghcAAAQvAAAIXgAAELwAAAheAAAQvAAAIHgBAEDwAgCA4AUAAMELAACCFwAAwQsAAIIXAAAELwAACF4AABC8AAAgeAEAQPACACB4AQBA8AIAgOAFAADBCwAAghcAAAQvAAAIXgAABC8AAAheAAAQvAAAIHgBAEDwAgCA4AUAAMELAIDgBQAAwQsAAIIXAAAELwAACF4AABC8AAAgeAEAELwAACB4AQBA8AIAgOAFAADBCwAAghcAAAQvAACCFwAABC8AAAheAAAQvAAAIHgBAEDwAgCA4AUAQPACAIDgBQAAwQsAAIIXAAAELwAACF4AABC8AAAIXgAAELwAACB4AQBA8AIAgOAFAADBCwAAghcAAMELAACCFwAABC8AAAheAAAQvAAAIHgBAEDwAgAgeAEAQPACAIDgBQAAwQsAAIIXAAAELwAAgtcKAAAQvAAAIHgBAEDwAgCA4AUAAMELAACCFwAAwQsAAIIXAAAELwAACF4AABC8AAAgeAEAQPACACB4AQBA8AIAgOAFAADBCwAAghcAAAQvAAAIXgAABC8AAAheAAAQvAAAIHgBAEDwAgCA4AUAAMELAIDgBQAAwQsAAIIXAAAELwAACF4AABC8AAAgeAEAELwAACB4AQBA8AIAgOAFAADBCwAAghcAAAQvAACCFwAABC8AAAheAAAQvAAAIHgBAEDwAgCA4AUAQPACAIDgBQAAwQsAAIIXAAAELwAACF4AABC8AAAIXgAAELwAACB4AQBA8AIAgOAFAADBCwAAghcAAMELAACCFwAABC8AAAheAAAQvAAAIHgBAEDwAgAgeAEAQPACAIDgBQAAwQsAAIIXAAAELwAACF4AAAQvAAAIXgAAELwAACB4AQBA8AIAgOAFAADBCwCA4AUAAMELAACCFwAABC8AAAheAAAQvAAAIHgBABC8AAAgeAEAQPACAIDgBQAAwQsAAIIXAAAELwAAghcAAAQvAAAIXgAAELwAACB4AQBA8AIAgOAFAEDwAgCA4AUAAMELAACCFwAABC8AAAheAAAQvAAACF4AABC8AAAgeAEAQPACAIDgBQAAwQsAAIIXAADBCwAAghcAAAQvAAAIXgAAELwAACB4AQBA8AIAIHgBAEDwAgCA4AUAAMELAACCFwAABC8AAAheAAAELwAACF4AABC8AAAgeAEAQPACAIDgBQAAwQsAgOAFAADBCwAAghcAAAQvAAAIXgAAELwAACB4AQAQvAAAIHgBAEDwAgCA4AUAAMELAACCFwAABC8AAIIXAAAELwAACF4AABC8AAAgeAEAQPACAIDgBQBA8AIAgOAFAADBCwAAghcAAAQvAAAIXgAAELwAAAheAAAQvAAAIHgBAEDwAgCA4AUAAMELAACCFwAAwQsAAIIXAAAELwAACF4AABC8AAAgeAEAQPACACB4AQBA8AIAgOAFAADBCwAAghcAAAQvAAAIXgAABC8AAAheAAAQvAAAIHgBAEDwAgCA4AUAAMELAIDgBQAAwQsAAIIXAAAELwAACF4AABC8AAAgeAEAELwAACB4AQBA8AIAgOAFAADBCwAAghcAAAQvAACCFwAABC8AAAheAAAQvAAAIHgBAEDwAgCA4AUAQPACAIDgBQAAwQsAAIIXAAAELwAACF4AABC8AAAIXgAAELwAACB4AQBA8AIAgOAFAADBCwAAghcAAMELAACCFwAABC8AAAheAAAQvAAAIHgBAEDwAgAgeAEAQPACAIDgBQAAwQsAAIIXAAAELwAACF4AAAQvAAAIXgAAELwAACB4AQBA8AIAgOAFAADBCwCA4AUAAMELAACCFwAABC8AAAheAAAQvAAACF4rAABA8AIAgOAFAADBCwAAghcAAAQvAAAIXgAABC8AAAheAAAQvAAAIHgBAEDwAgCA4AUAAMELAIDgBQAAwQsAAIIXAAAELwAACF4AABC8AAAgeAEAELwAACB4AQBA8AIAgOAFAADBCwAAghcAAAQvAACCFwAABC8AAAheAAAQvAAAIHgBAEDwAgCA4AUAQPACAIDgBQAAwQsAAIIXAAAELwAACF4AABC8AAAIXgAAELwAACB4AQBA8AIAgOAFAADBCwAAghcAAMELAACCFwAABC8AAAheAAAQvAAAIHgBAEDwAgAgeAEAQPACAIDgBQAAwQsAAIIXAAAELwAACF4AAAQvAAAIXgAAELwAACB4AQBA8AIAgOAFAADBCwCA4AUAAMELAACCFwAABC8AAAheAAAQvAAAIHgBABC8AAAgeAEAQPACAIDgBQAAwQsAAIIXAAAELwAAghcAAAQvAAAIXgAAELwAACB4AQBA8AIAgOAFAEDwAgCA4AUAAMELAACCFwAABC8AAAheAAAQvAAACF4AABC8AAAgeAEAQPACAIDgBQAAwQsAAIIXAADBCwAAghcAAAQvAAAIXgAAELwAACB4AQBA8AIAIHgBAEDwAgCA4AUAAMELAACCFwAABC8AAAheAAAELwAACF4AABC8AAAgeAEAQPACAIDgBQAAwQsAgOAFAADBCwAAghcAAAQvAAAIXgAAELwAACB4AQAQvAAAIHgBAEDwAgCA4AUAAMELAACCFwAABC8AAIIXAAAELwAACF4AABC8AAAgeAEAQPACAIDgBQBA8AIAgOAFAADBCwAAghcAAAQvAAAIXgAAELwAAAheAAAQvAAAIHgBAEDwAgCA4AUAAMELAACCFwAAwQsAAIIXAAAELwAACF4AABC8AAAgeAEAQPACACB4AQBA8AIAgOAFAADBCwAAghcAAAQvAAAIXgAABC8AAAheAAAQvAAAIHgBAEDwAgCA4AUAAMELAIDgBQAAwQsAAIIXAAAELwAAvGfwVlVlGwAADEK/bU/Bezwei29fPs2sBwCAnKWmTW3bCXGu4qTQnczn80V6eLv6vbMqAABy8/PH1/YF7nK5TF37EGeXgvc8zkU/esuydMQBAICs1HXdnlrox26c+9A0TRFCeBW91gUAQMZOsRtb96kN3qQXvWM7AgAgY49d7Kab/wIMAPtyckUaN/mAAAAAAElFTkSuQmCC";
			var moneygold = "data:image/gif;base64,R0lGODlhDQANAMQfAF5RH9GyDOnLOdrMa4hzGyUjG9K5SruUFeXgk7GZK8OaFrSMF9O5P8SmOMikI9bBT6mJCs6xOunLSdCtJ8CdJT01GKqYFeHWdP%2FnSa6eRbOhGvzsbtq6Kd3BEOXHEjg4OCH5BAEAAB8ALAAAAAANAA0AAAVx4Cd%2BRVUV6DmiAHRQMKGShHIsijAdWkXvN8hi4egQPhUOR4FzvBweSIGgOygCikYkYiwkBIlFQ8swRALShmCDMFwuD8MkQCgAEgME4jJ4RARSKBYcD3APDBIZPiIVGhgCAhIGMiMkJQCYAAWVKyiblSEAOw%3D%3D";
			var moneysilver = "data:image/gif;base64,R0lGODlhDQANAMQfAGpqaisrK3FxcaampoaGhiMjI62trYmJiZubm5KSktPT07q6um5ubl1dXYKCgpaWllVVVUVFR3R0dDw8PLGxsTIyMkpKSn19fXl5eWBgYBISEmZmZtvb283NzcDAwDg4OCH5BAEAAB8ALAAAAAANAA0AAAV54Cd%2BRRkEVTGKxZQxhwRY2hhYwAY8SSM1qgrBAWBkGoDiJVDIIAg5AUBwEUgCEcLDIWAAHIOH5AoZJC4YzAExQGAkFUtiwTEYFB7zAVJyKjgcHhQHBw4VNRUSFwsdDwQDB4c2BHYGFAMTKyITEBERGQE1miQFGiorIQA7";
			var moneycopper = "data:image/gif;base64,R0lGODlhDQANAMQfAJVFG2xLOSYeHJZXOL6PbbqCYotGIk01KLp0SZZLItu5nYY7GWU6JNGFVaRcMbFoO614VJlQKaVmQ5hmSXw7GFMrF9Ktj51eOsOATNageLZ5UqlwTYFLMJFWNt3Apjg4OCH5BAEAAB8ALAAAAAANAA0AAAVn4CeKQmmOo1AtxsAxAiqwS9I4FFCJh2MYC8qiFkl8BJyHgWJINIsUAePhe24gl0S0g%2BgMDJ1r4QKIchAZy4VgIUAeulKHoPC0sbiYNDJpTyQIMDFHDBoYGBoFAYMoAQcMBweMMicoIQA7";

			var x;

			var ua = navigator.userAgent.toLowerCase();
			var isIE = (/msie/.test(ua)) && !(/opera/.test(ua)) && (/win/.test(ua));

			var style_node = document.createElement("style");
			style_node.setAttribute("type", "text/css");
			style_node.setAttribute("media", "screen");

			document.getElementsByTagName("head")[0].appendChild(style_node);
			if (z) power_css += power_ie_css;
			if (z && V) power_css += power_ie6_css;
			if (!isIE) {
				power_css = power_css.replace(/images\/power\/tooltip\.png/,'"'+tooltip_png+'"');
				power_css = power_css.replace(/images\/power\/icon_border_medium\.png/,'"'+icon_border_medium+'"');
				power_css = power_css.replace(/images\/power\/socket_blue\.gif/,'"'+socket_blue+'"');
				power_css = power_css.replace(/images\/power\/socket_red\.gif/,'"'+socket_red+'"');
				power_css = power_css.replace(/images\/power\/socket_yellow\.gif/,'"'+socket_yellow+'"');
				power_css = power_css.replace(/images\/power\/socket_meta\.gif/,'"'+socket_meta+'"');
				power_css = power_css.replace(/images\/power\/socket_prismatic\.gif/,'"'+socket_prismatic+'"');
				power_css = power_css.replace(/images\/power\/money_gold\.gif/,'"'+moneygold+'"');
				power_css = power_css.replace(/images\/power\/money_silver\.gif/,'"'+moneysilver+'"');
				power_css = power_css.replace(/images\/power\/money_copper\.gif/,'"'+moneycopper+'"');
				
				rules = power_css.split('}');
				for (x = 0; x < rules.length; x++) style_node.appendChild(document.createTextNode(rules[x] + "}"));
			} else {
				style_node.styleSheet.cssText = power_css;
			}
			s(document, "mouseover", g)
		}
		function P(AQ) {
			var AR = AH(AQ);
			w = AR.x;
			u = AR.y
		}
		function AN(Aa, AY) {
			if (Aa.nodeName != "A" && Aa.nodeName != "AREA") {
				return - 2323
			}
			if (!Aa.href.length) {
				return
			}
			if (Aa.getAttribute('rel') && (!Aa.rel)) Aa.rel = Aa.getAttribute('rel');
			if (Aa.rel == 'notip') return;
			var AW, AU, AS, AR, AT = {};
			if (Aa.getAttribute('extratip')) AT.extratip = Aa.getAttribute('extratip');
			var AQ = function(Ab, Ad, Ac) {
				if (Ad == "buff" || Ad == "sock") {
					AT[Ad] = true
				} else {
					if (Ad == "rand" || Ad == "ench" || Ad == "lvl" || Ad == "c" || Ad == "dur") {
						AT[Ad] = parseInt(Ac)
					} else {
						if (Ad == "gems" || Ad == "pcs") {
							AT[Ad] = Ac.split(":")
						} else {
							if (Ad == "who" || Ad == "rank" || Ad == "domain") {
								AT[Ad] = Ac.replace(/</g,'&lt;').replace(/>/g,'&gt;');
							} else {
								if (Ad == "when" || Ad == "looted") {
									AT[Ad] = new Date(parseInt(Ac));
									/* AT[Ad] = new Date(parseInt(Ac)+AT[Ad].getTimezoneOffset()*60000); */
								}
							}
						}
					}
				}
			};
			if (a.applyto & 1) {
				AW = 1;
				AU = 2;
				AS = 3;
				AR = Aa.href.match(/^http:\/\/(www|dev|fr|es|de|ru|wotlk|ptr)?\.?wowhead\.com\/\??(item|quest|spell|achievement|transmog-set|faction)=([0-9]+)/);
				n = 0
			}
			if (AR == null && (a.applyto & 2) && Aa.rel) {
				AW = 0;
				AU = 1;
				AS = 2;
				AR = Aa.rel.match(/(item|quest|spell|achievement|transmog-set|faction).?([0-9]+)/);
				n = 1
			}
			if (Aa.rel) {
				Aa.rel.replace(/([a-zA-Z]+)=([^&]*)/g, AQ);
				if (AT.gems && AT.gems.length > 0) {
					var AX;
					for (AX = Math.min(3, AT.gems.length - 1); AX >= 0; --AX) {
						if (parseInt(AT.gems[AX])) {
							break
						}
					}++AX;
					if (AX == 0) {
						delete AT.gems
					} else {
						if (AX < AT.gems.length) {
							AT.gems = AT.gems.slice(0, AX)
						}
					}
				}
			}
			if (AR) {
				var AZ, AV = "www";
				if (AT.domain) {
					AV = AT.domain
				} else {
					if (AW && AR[AW]) {
						AV = AR[AW]
					}
				}
				AZ = c(AV);
				if (AV == "wotlk" || AV == "ptr") {
					AV = "www"
				}
				r = AV;
				if (!Aa.onmousemove) {
					Aa.onmousemove = B;
					Aa.onmouseout = D
				}
				P(AY);
				j(AF(AR[AU]), AR[AS], AZ, AT)
			}
		}
		function g(AS) {
			AS = l(AS);
			var AR = AS._target;
			var AQ = 0;
			while (AR != null && AQ < 3 && AN(AR, AS) == -2323) {
				AR = AR.parentNode; ++AQ
			}
		}
		function B(AQ) {
			AQ = l(AQ);
			P(AQ);
			d()
		}
		function D() {
			J = null;
			W = null;
			U()
		}
		function G() {
			if (!x) {
				var AV = t("div"),
				AZ = t("table"),
				AS = t("tbody"),
				AU = t("tr"),
				AR = t("tr"),
				AQ = t("td"),
				AY = t("th"),
				AX = t("th"),
				AW = t("th");
				AV.className = "wowhead-tooltip";
				AY.style.backgroundPosition = "top right";
				AX.style.backgroundPosition = "bottom left";
				AW.style.backgroundPosition = "bottom right";
				O(AU, AQ);
				O(AU, AY);
				O(AS, AU);
				O(AR, AX);
				O(AR, AW);
				O(AS, AR);
				O(AZ, AS);
				f = t("p");
				f.style.display = "none";
				icondiv = O(f, t("div"));
				icondiv.style.position='relative';
				qdiv = O(icondiv, t("div"));
 				with (qdiv.style) {
					color='white';
					fontSize='13px';
					fontWeight='bold';
					position='absolute';
					bottom='4px';
					right='6px';
					height='auto';
					width='auto';
					backgroundImage='none';
					textShadow='-1px -1px 1px black,-1px 0px 1px black,-1px 1px 1px black,0px -1px 1px black,0px 1px 1px black,1px -1px 1px black,1px 0px 1px black,1px 1px 1px black';
				}
				O(AV, f);
				O(AV, AZ);
				O(document.body, AV);
				x = AV;
				Y = AZ;
				C = AQ;
				var AT = t("div");
				AT.className = "wowhead-tooltip-powered";
				O(AV, AT);
				AI = AT;
				U()
			}
		}
		function AP(AS, AT, iconqty) {
			var AU = false;
			if (!x) {
				G()
			}
			if (!AS) {
				AS = S[J][2] + " not found :(";
				AT = "inv_misc_questionmark";
				AU = true
			} else {
				if (W == null) {
					W = {}
				}
				if (W.pcs && W.pcs.length) {
					var AV = 0;
					for (var AR = 0, AQ = W.pcs.length; AR < AQ; ++AR) {
						if (m = AS.match(new RegExp("<span><!--si([0-9]+:)*" + W.pcs[AR] + "(:[0-9]+)*-->"))) {
							AS = AS.replace(m[0], '<span class="q8"><!--si' + W.pcs[AR] + "-->"); ++AV
						}
					}
					if (AV > 0) {
						AS = AS.replace("(0/", "(" + AV + "/");
						AS = AS.replace(new RegExp("<span>\\(([0-" + AV + "])\\)", "g"), '<span class="q2">($1)')
					}
				}
/*				if (W.c) {
					AS = AS.replace(/<span class="c([0-9]+?)">(.+?)<\/span>/g, '<span class="c$1" style="display: none">$2</span>');
					AS = AS.replace(new RegExp('<span class="c(' + W.c + ')" style="display: none">(.+?)</span>', "g"), '<span class="c$1">$2</span>')
				}
*/				if (W.lvl) {
					AS = AS.replace(/\(<!--r([0-9]+):([0-9]+):([0-9]+)-->([0-9.%]+)(.+?)([0-9]+)\)/g,
					function(AX, AX, AY, AW, AX, Aa, AX) {
						var AZ = o(W.lvl, AY, AW);
						AZ = (Math.round(AZ * 100) / 100);
						if (AY != 12 && AY != 37) {
							AZ += "%"
						}
						return "(<!--r" + W.lvl + ":" + AY + ":" + AW + "-->" + AZ + ")"; // + Aa + W.lvl + ")"
					})
				}
				if (W.who || W.when) {
					AS = AS.replace("<table><tr><td><br />", '<table><tr><td><br /><span class="q2">Achievement earned '+(W.who?'by ' + W.who:'') + (W.when?' on <nobr>' + W.when.toLocaleString() + '</nobr>':'') + (W.rank?'<br /><i>('+((W.who.indexOf('&lt;')<0)?'Guild first, ':'')+ord(W.rank)+' on Realm)</i>':'') + "</span><br /><br />");
					AS = AS.replace(/class="q0"/g, 'class="r3"')
				}
				if (W.looted) {
					if (AS.indexOf('<hr') < 0) {
						AS += '<hr style="height: 1px; margin-bottom: 1px"/>';
					} else AS += '<br/>';
					AS += '<small class="q0">Obtained on <nobr>' + W.looted.toLocaleString() + '</nobr></small>';
				}
						
				if (W.dur) {
					AS = AS.replace(/Durability \d+ \/ /,'Durability '+W.dur+' / ');
				}
			}
			if (AI) {
				AI.style.display = (n && !AU ? "": "none")
			}
			if (F && AT) {
				iconurl = AT;
				if (iconurl.indexOf('/')<0) iconurl=((location.protocol=='http:')?'http://cdn.tuj.me/':'https://static-undermine.netdna-ssl.com/')+'icon/medium/'+AT.toLowerCase()+'.jpg'; //iconurl='http://static.wowhead.com/images/icons/medium/'+AT.toLowerCase()+'.jpg';
				while (qdiv.firstChild) qdiv.removeChild(qdiv.firstChild);
				if (typeof iconqty != 'undefined') {
					newspan = t('span');
					newspan.innerHTML = iconqty;
					O(qdiv,newspan);
				}
				f.style.backgroundImage = "url(\""+iconurl+"\")";
				f.style.display = ""
			} else {
				f.style.backgroundImage = "none";
				f.style.display = "none"
			}
			x.style.display = "";
			x.style.width = "400px";
			C.innerHTML = AS+(W.extratip?('<div style="margin-top: 2ex">'+W.extratip+'</div>'):'');
			AL();
			d();
			x.style.visibility = "visible";
		}
		function ord(n) {
			var sfx = ["th","st","nd","rd"];
			var val = n%100;
			return n + (sfx[(val-20)%10] || sfx[val] || sfx[0]);
		}
		function U() {
			if (!x) {
				return
			}
			x.style.display = "none";
			x.style.visibility = "hidden";
		}
		function AL() {
			var AR = C.childNodes;
			if (AR.length >= 2 && AR[0].nodeName == "TABLE" && AR[1].nodeName == "TABLE") {
				AR[0].style.whiteSpace = "nowrap";
				var AQ;
				if (AR[1].offsetWidth > 380) {
					AQ = Math.max(380, AR[0].offsetWidth) + 20
				} else {
					AQ = Math.max(AR[0].offsetWidth, AR[1].offsetWidth) + 20
				}
				if (AQ > 20) {
					x.style.width = AQ + "px";
					AR[0].style.width = AR[1].style.width = "100%"
				}
			} else {
				x.style.width = Y.offsetWidth + "px"
			}
		}
		function d() {
			if (!x) {
				return
			}
			if (w == null) {
				return
			}
			var AZ = AB(),
			Aa = b(),
			AW = AZ.w,
			AT = AZ.h,
			AV = Aa.x,
			AS = Aa.y,
			AU = Y.offsetWidth,
			AQ = Y.offsetHeight,
			AR = w + Q,
			AY = u - AQ - k;
			if (AR + Q + AU + 4 >= AV + AW) {
				var AX = w - AU - Q;
				if (AX >= 0) {
					AR = AX
				} else {
					AR = AV + AW - AU - Q - 4
				}
			}
			if (AY < AS) {
				AY = u + k;
				if (AY + AQ > AS + AT) {
					AY = AS + AT - AQ;
					if (F) {
						if (w >= AR - 48 && w <= AR && u >= AY - 4 && u <= AY + 48) {
							AY -= 48 - (u - AY)
						}
					}
				}
			}
			x.style.left = AR + "px";
			x.style.top = AY + "px"
		}
		function AJ(AQ) {
			return ((W && W.buff) ? "buff_": "tooltip_") + H[AQ]
		}
		function AE(AS, AT, AR) {
			var AQ = S[AS][0];
			if (AQ[AT] == null) {
				AQ[AT] = {}
			}
			if (AQ[AT].status == null) {
				AQ[AT].status = {}
			}
			if (AQ[AT].status[AR] == null) {
				AQ[AT].status[AR] = AD
			}
		}
		function j(AT, AV, AR, AU) {
			if (!AU) {
				AU = {}
			}
 			if (AT == 101) { //transmog struct
 				AP('<img src="http://wowimg.zamimg.com/images/transmogsets/big/'+AV+'.jpg" style="display: block; margin: 0 auto" />','',1);
 				return;
 			}
			var AS = I(AV, AU);
			J = AT;
			y = AS;
			AG = AR;
			W = AU;
			AE(AT, AS, AR);
			var AQ = S[AT][0];
			if (AQ[AS].status[AR] == AC || AQ[AS].status[AR] == q) {
				AP(AQ[AS][AJ(AR)], AQ[AS].icon, AQ[AS].quantity)
			} else {
				if (AQ[AS].status[AR] == N) {
					if (wowhead_avail) AP(i.loading); else AP(i.noresponse);
				} else {
					E(AT, AV, AR, null, AU)
				}
			}
		}
		function E(AW, AQ, AY, AV, AS) { return;
			var AX = I(AQ, AS);
			var AU = S[AW][0];
			if (AU[AX].status[AY] != AD && AU[AX].status[AY] != L) {
				return
			}
			AU[AX].status[AY] = N;
			if (!AV) {
				AU[AX].timer = setTimeout(function() {
					M.apply(this, [AW, AX, AY])
				},
				333)
			}
			var AR = "";
			for (var AT in AS) {
				if (AT != "rand" && AT != "ench" && AT != "gems" && AT != "lvl") {
					continue
				}
				if (typeof AS[AT] == "object") {
					AR += "&" + AT + "=" + AS[AT].join(":")
				} else {
					if (AT == "sock") {
						AR += "&sock"
					} else {
						AR += "&" + AT + "=" + AS[AT]
					}
				}
			}
			switch (S[AW][1]) {
				case 'faction':
					break;
				case 'item':
				case 'spell':
				default:
					A("http://" + r + ".wowhead.com/" + S[AW][1] + "=" + AQ + AR + "&power&lol");
			} 
			//A("http://" + r + ".wowhead.com/" + S[AW][1] + "=" + AQ + AR + "&power&lol");
		}
		function A(AQ) {
			O(R, t("script", {
				type: "text/javascript",
				src: AQ
			}))
		}
		whloadspan_timeleft = 0;
		function M(AS, AT, AR) { return;
			if (J == AS && y == AT && AG == AR) {
				//if (wowhead_avail) {
					AP(i.loading);
					var AQ = S[AS][0];
					AQ[AT].timer = setTimeout(function() {
						v.apply(this, [AS, AT, AR])
					},
					3850)
					whloadspan_timeleft = 3000;
					setTimeout(update_whloadspan,850);
				//} else AP(i.noresponse);
			}
		}
		function update_whloadspan() {
			timeleft = whloadspan_timeleft;
			if (!(s = document.getElementById('whloadspan'))) return;
			if (timeleft <= 0) { s.innerHTML = ''; return; }
			s.innerHTML = '' + Math.round(timeleft/1000);
			whloadspan_timeleft = timeleft-500;
			setTimeout(update_whloadspan,500);
		}
		function v(AS, AT, AR) {
			var AQ = S[AS][0];
			AQ[AT].status[AR] = L;
			if (J == AS && y == AT && AG == AR) {
				AP(i.tooltip_noresponse)
			}
		}
		function I(AR, AQ) {
			return AR + (AQ.rand ? "r" + AQ.rand: "") + (AQ.ench ? "e" + AQ.ench: "") + (AQ.gems ? "g" + AQ.gems.join(",") : "") + (AQ.sock ? "s": "")
		}
		this.register = function(AT, AU, AR, AS) {
			var AQ = S[AT][0];
			if (AQ[AU]) {
				clearTimeout(AQ[AU].timer);
				AK(AQ[AU], AS);
				if (AQ[AU][AJ(AR)]) {
					AQ[AU].status[AR] = AC
				} else {
					AQ[AU].status[AR] = q
				}
				if (J == AT && AU == y && AG == AR) {
					AP(AQ[AU][AJ(AR)], AQ[AU].icon, AQ[AU].quantity)
				}
			} else {
				S[AT][0][AU] = AS;
				S[AT][0][AU].status = {};
				S[AT][0][AU].status[0] = q;
			}
		};
		this.registerItem = function(AS, AQ, AR) {
			this.register(h, AS, AQ, AR)
		};
		this.registerQuest = function(AS, AQ, AR) {
			this.register(p, AS, AQ, AR)
		};
		this.registerSpell = function(AS, AQ, AR) {
			this.register(X, AS, AQ, AR)
		};
		this.registerAchievement = function(AS, AQ, AR) {
			this.register(AA, AS, AQ, AR)
		};
		this.registerFaction = function(a,b,c) {
			this.register(8,a,b,c);
		}
		this.set = function(AQ) {
			AK(a, AQ)
		};
		this.showTooltip = function(AS, AR, AQ) {
			P(AS);
			AP(AR, AQ)
		};
		this.hideTooltip = function() {
			U()
		};
		this.moveTooltip = function(AQ) {
			B(AQ)
		};
		wowhead_avail = true;
		this.setWowhead = function(tf){wowhead_avail=tf};
		AM()
	}
};
