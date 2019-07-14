exports.ids=[2],exports.modules={37:function(t,e,r){"use strict";r.r(e);var o={name:"Configuration",fetch:({store:t,redirect:e})=>t.state.auth.isAuth&&t.state.auth.isOwner?void 0:e("/"),head(){return{titleTemplate:"%s - "+this.title}},data:()=>({title:"Configuration",maxVideoDuration:0,maxPlaylistSize:0,volume:0,shard:"steam",shardsSelectOptions:[{value:"kakao",text:"Kakao"},{value:"psn",text:"PS4"},{value:"steam",text:"Steam"},{value:"tournament",text:"Tournaments"},{value:"xbox",text:"Xbox"}],callsPerMinute:1,form:{maxVideoDuration:0,maxPlaylistSize:0,volume:0,shard:"steam",callsPerMinute:1}}),async asyncData({$axios:t}){try{const e=await t.$get("derpy/maxVideoDuration"),r=await t.$get("derpy/maxPlaylistSize"),o=await t.$get("derpy/volume"),m=await t.$get("derpy/pubgShard"),l=await t.$get("derpy/pubgCallsPerMinute");return{maxVideoDuration:e[0].value,maxPlaylistSize:r[0].value,volume:o[0].value,shard:m[0].value,callsPerMinute:l[0].value}}catch(t){}},mounted(){this.$store.dispatch("breadcrumbs/setCrumbs",this.$route.path),this.form={maxVideoDuration:this.maxVideoDuration/60,maxPlaylistSize:this.maxPlaylistSize,volume:100*this.volume,shard:this.shard,callsPerMinute:this.callsPerMinute}},methods:{async submitUpdate(t){t.preventDefault();const e=60*this.form.maxVideoDuration,r=this.form.maxPlaylistSize,o=this.form.volume/100,m=this.form.shard,l=this.form.callsPerMinute;if(e===this.maxVideoDuration&&r===this.maxPlaylistSize&&o===this.volume&&m===this.shard&&l===this.callsPerMinute&&this.$toast.warning("Aucune modification"),e!==this.maxVideoDuration){const t=await this.update(e,"maxVideoDuration","Durée maximum des vidéos modifiée");this.maxVideoDuration=t,this.form.maxVideoDuration=t/60}if(r!==this.maxPlaylistSize){const t=await this.update(r,"maxPlaylistSize","Nombre d'entrées maximum de la liste de lecture modifiée");this.maxPlaylistSize=t,this.form.maxPlaylistSize=t}if(o!==this.volume){const t=await this.update(o,"volume","Volume modifié");this.volume=t,this.form.volume=100*t}if(m!==this.shard){const t=await this.update(m,"pubgShard","Shard modifiée");this.shard=t,this.form.shard=t}if(l!==this.callsPerMinute){const t=await this.update(l,"pubgCallsPerMinute","Nombre d'appels à l'API de PUBG modifié");this.callsPerMinute=t,this.form.callsPerMinute=t}},async update(t,e,r){try{if(0===(await this.$axios({method:"patch",data:{value:t},url:"derpy/"+e})).data.modifed)this.$toast.warning("Aucune modification");else{this.$toast.success(r);try{return(await this.$axios.$get("derpy/"+e))[0].value}catch(t){this.$axiosGetErrorHandler(t)}}}catch(t){this.$axiosPostErrorHandler(t,"Configuration non trouvé","Cette configuration existe déjà","Erreur avec l'édition de la configuration")}}}},m=r(1),component=Object(m.a)(o,function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",[r("b-jumbotron",{staticClass:"mt-3 mb-3 pt-4 pb-4",attrs:{fluid:"","bg-variant":"dark","text-variant":"light",header:"Administration: Configuration",lead:"Configuration de Derpy."}}),t._ssrNode(" "),r("b-container",[r("b-breadcrumb",{attrs:{items:t.$store.state.breadcrumbs.crumbs}})],1),t._ssrNode(" "),r("b-container",[r("b-form",{on:{submit:t.submitUpdate}},[r("h2",[t._v("Music")]),t._v(" "),r("hr",{staticClass:"border-primary"}),t._v(" "),r("h4",[t._v("Durée maximum des vidéos: "),r("strong",{staticClass:"text-primary"},[t._v(t._s(t.form.maxVideoDuration)+" minute"+t._s(t.form.maxVideoDuration>1?"s":""))])]),t._v(" "),r("b-input-group",{staticClass:"mb-5",attrs:{prepend:"0",append:"60"}},[r("b-form-input",{attrs:{type:"range",min:"0",max:"60"},model:{value:t.form.maxVideoDuration,callback:function(e){t.$set(t.form,"maxVideoDuration",e)},expression:"form.maxVideoDuration"}})],1),t._v(" "),r("h4",[t._v("Nombre d'entrées maximum de la liste de lecture: "),r("strong",{staticClass:"text-primary"},[t._v(t._s(t.form.maxPlaylistSize)+" entrée"+t._s(t.form.maxPlaylistSize>1?"s":""))])]),t._v(" "),r("b-input-group",{staticClass:"mb-5",attrs:{prepend:"0",append:"40"}},[r("b-form-input",{attrs:{type:"range",min:"0",max:"40"},model:{value:t.form.maxPlaylistSize,callback:function(e){t.$set(t.form,"maxPlaylistSize",e)},expression:"form.maxPlaylistSize"}})],1),t._v(" "),r("h4",[t._v("Volume: "),r("strong",{staticClass:"text-primary"},[t._v(t._s(t.form.volume))])]),t._v(" "),r("b-input-group",{staticClass:"mb-5",attrs:{prepend:"0",append:"100"}},[r("b-form-input",{attrs:{type:"range",min:"0",max:"100"},model:{value:t.form.volume,callback:function(e){t.$set(t.form,"volume",e)},expression:"form.volume"}})],1),t._v(" "),r("h2",[t._v("PUBG")]),t._v(" "),r("hr",{staticClass:"border-primary"}),t._v(" "),r("h4",[t._v("PUBG shard: "),r("strong",{staticClass:"text-primary"},[t._v(t._s(t.form.shard))])]),t._v(" "),r("b-form-select",{staticClass:"mb-5",attrs:{options:t.shardsSelectOptions},model:{value:t.form.shard,callback:function(e){t.$set(t.form,"shard",e)},expression:"form.shard"}}),t._v(" "),r("h4",[t._v("Nombre d'appels à l'API de PUBG par minute: "),r("strong",{staticClass:"text-primary"},[t._v(t._s(t.form.callsPerMinute))])]),t._v(" "),r("b-input-group",{staticClass:"mb-5",attrs:{prepend:"1",append:"8"}},[r("b-form-input",{attrs:{type:"range",min:"1",max:"8"},model:{value:t.form.callsPerMinute,callback:function(e){t.$set(t.form,"callsPerMinute",e)},expression:"form.callsPerMinute"}})],1),t._v(" "),r("b-button",{attrs:{type:"submit",block:"",variant:"primary"}},[t._v("Appliquer les modifications")])],1)],1)],2)},[],!1,null,null,"2fe2bb00");e.default=component.exports}};
//# sourceMappingURL=6e1764359329cdb99639.js.map