//#region node_modules/.nitro/vite/services/ssr/assets/plan-limits-BTcbeEK0.js
/**
* Per-plan limits. `null` means unlimited.
* Keep both weekly and daily cover-letter keys on every plan so consumers can
* read either key without conditional shape checks.
*/
var PLAN_LIMITS = {
	free: {
		cvProfiles: 1,
		matchScorePerDay: 3,
		keywordsPerDay: 2,
		coverLetterPerWeek: 1,
		coverLetterPerDay: null
	},
	paid: {
		cvProfiles: 5,
		matchScorePerDay: null,
		keywordsPerDay: null,
		coverLetterPerWeek: null,
		coverLetterPerDay: 15
	}
};
function getPlanLimits(plan) {
	return PLAN_LIMITS[plan ?? "free"];
}
//#endregion
export { getPlanLimits as t };
