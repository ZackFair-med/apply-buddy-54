//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-CxHIQ4U4.js
var manifest = {
	"0b6eaaf0affa05d8406d489ac99eda00e3421778cab940e69680df0823f93f94": {
		functionName: "deleteJob_createServerFn_handler",
		importer: () => import("./_ssr/jobs.functions-D4mvJpq4.mjs")
	},
	"0f6b44b459f0f5a7154aecdbd6de5f39fc93825d0d32caf19f26936089e5a107": {
		functionName: "listJobs_createServerFn_handler",
		importer: () => import("./_ssr/jobs.functions-D4mvJpq4.mjs")
	},
	"21069aa8cf9eddfe4c6f569b2bb527f8abb191398604a6c5874d250675084395": {
		functionName: "uploadCv_createServerFn_handler",
		importer: () => import("./_ssr/cvs.functions-D9E5ojyv.mjs")
	},
	"35233fa56c6aedd43ff6c3c8c71988cb90e6e799e3aa86bf7a18df683b4bf32a": {
		functionName: "deleteCv_createServerFn_handler",
		importer: () => import("./_ssr/cvs.functions-D9E5ojyv.mjs")
	},
	"432b934c493a65b20930541aa425464f2c52d0a8716794775211fc250ec5a8e5": {
		functionName: "getJob_createServerFn_handler",
		importer: () => import("./_ssr/jobs.functions-D4mvJpq4.mjs")
	},
	"4abacc882bd13bcdc7a0a5dcb68d2f908b598dee19711ba74816a9bf895ce960": {
		functionName: "analyzeMatch_createServerFn_handler",
		importer: () => import("./_ssr/tailor.functions-DHzNk5QP.mjs")
	},
	"73e7acc5b4c3d342b60aaf211c488067ddb9df28965f66221baa7938ea3e3ce9": {
		functionName: "listCvs_createServerFn_handler",
		importer: () => import("./_ssr/cvs.functions-D9E5ojyv.mjs")
	},
	"787e0a959e011f95b58ac21f04b325d4cce5874ea7030722a8665f02a6063c1d": {
		functionName: "getUsageSummary_createServerFn_handler",
		importer: () => import("./_ssr/usage.functions-bQeKYDZT.mjs")
	},
	"7abb1d2f3118c756ff32d2392b98c7011b60faeff53a08e854bcf983892ac3e3": {
		functionName: "deleteJobs_createServerFn_handler",
		importer: () => import("./_ssr/jobs.functions-D4mvJpq4.mjs")
	},
	"7bd270fb138166e4d0abe98cb0ce1ad0ec90c8a4a876cdd9ed9581c3d8a0109d": {
		functionName: "updateJobsStatus_createServerFn_handler",
		importer: () => import("./_ssr/jobs.functions-D4mvJpq4.mjs")
	},
	"8ca2404dc8aefb21eebf56d676fd57337f9420879476ad174be364776cfe7a32": {
		functionName: "extractKeywords_createServerFn_handler",
		importer: () => import("./_ssr/tailor.functions-DHzNk5QP.mjs")
	},
	"9df9652da79c7ccc337ce62c64dcd11f1800a8eb6e0bd13747650358f67fe4e8": {
		functionName: "getProfile_createServerFn_handler",
		importer: () => import("./_ssr/profile.functions-D7ALAovg.mjs")
	},
	"9e7c54c89030709ae870530516cac2bb1753afd36b79dd656f3334435393a850": {
		functionName: "downloadCv_createServerFn_handler",
		importer: () => import("./_ssr/cvs.functions-D9E5ojyv.mjs")
	},
	"a1f1e1fb45c284056d4af0d8c66b6ea4b81c945d94c7996a5c625e62f430fd86": {
		functionName: "updateCv_createServerFn_handler",
		importer: () => import("./_ssr/cvs.functions-D9E5ojyv.mjs")
	},
	"a9a60f4ab318fbfaeb24adc4dddd7ada313bd53fc3ee25029c7aa5552b742d64": {
		functionName: "listMatchHistory_createServerFn_handler",
		importer: () => import("./_ssr/history.functions-DiY9Vgql.mjs")
	},
	"ab0e7c09b47d7ada2f8e5674d2a34621a0be302c11db7c58ae029c8e93152a4c": {
		functionName: "createJob_createServerFn_handler",
		importer: () => import("./_ssr/jobs.functions-D4mvJpq4.mjs")
	},
	"b04a7dd5fe6d3ab53e9a31603660271b9c3b5510d7c6be92f02f78bf5e625c8c": {
		functionName: "updateJob_createServerFn_handler",
		importer: () => import("./_ssr/jobs.functions-D4mvJpq4.mjs")
	},
	"d94d0b5402d88327ffc5615e3b5d2a6f5e7a519b2121a922cbe6da824cc59c6d": {
		functionName: "updateProfile_createServerFn_handler",
		importer: () => import("./_ssr/profile.functions-D7ALAovg.mjs")
	},
	"db1ed20c317dc9f90eff319ec6aa929a298d1332e777ffd1bdd52a5215228f82": {
		functionName: "generateCoverLetter_createServerFn_handler",
		importer: () => import("./_ssr/tailor.functions-DHzNk5QP.mjs")
	},
	"e3724759230797f56a37af0d23e62140c27061011da5cab9dfb38b59e284a950": {
		functionName: "deleteAccount_createServerFn_handler",
		importer: () => import("./_ssr/profile.functions-D7ALAovg.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
