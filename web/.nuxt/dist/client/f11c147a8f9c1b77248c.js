(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{205:function(t,e,n){"use strict";n.r(e);var r=n(0),o=(n(42),n(13)),l=(n(7),{name:"module-configuration",props:["data"],data:function(){return{name:null,channelTypes:{},form:{enabled:null,textChannel:null,textChannels:[],voiceChannel:null,voiceChannels:[]},textOptions:[],voiceOptions:[]}},mounted:function(){this.name=this.data.name,this.channelTypes=this.getChannelTypes(this.data.channels),this.textOptions=this.$store.state.botinfo.info.textOptions,this.voiceOptions=this.$store.state.botinfo.info.voiceOptions,this.setDefaultValues()},methods:{setDefaultValues:function(){this.form.enabled=this.data.enabled,this.form.textChannel=this.data.textChannel,this.form.textChannels=this.data.textChannels,this.form.voiceChannel=this.data.voiceChannel,this.form.voiceChannels=this.data.voiceChannels},getChannelTypes:function(t){var e={textChannel:!1,textChannels:!1,voiceChannel:!1,voiceChannels:!1};return t>=8&&(e.voiceChannels=!0,t-=8),t>=4&&(e.voiceChannel=!0,t-=4),t>=2&&(e.textChannels=!0,t-=2),1==t&&(e.textChannel=!0),e},submitUpdate:function(t){t.preventDefault(),this.$emit("submitUpdate",this.name,{enabled:this.form.enabled,textChannel:this.form.textChannel,textChannels:this.form.textChannels,voiceChannel:this.form.voiceChannel,voiceChannels:this.form.voiceChannels})}}}),c=n(24),h=Object(c.a)(l,function(){var t=this,e=t.$createElement,n=t._self._c||e;return t.data.channels>0?n("b-container",{staticClass:"mb-3"},[n("h2",[t._v(t._s(t.name))]),t._v(" "),n("hr",{staticClass:"border-primary"}),t._v(" "),n("b-form",{on:{submit:t.submitUpdate}},[n("b-card",{staticClass:"mb-3",attrs:{"no-body":""}},[n("b-tabs",{attrs:{"content-class":"mt-3",fill:"",card:""}},[n("b-tab",{attrs:{title:"Canal (texte)",disabled:!t.channelTypes.textChannel}},[n("b-form-group",{attrs:{label:"Sélectionne sur quel canal textuel le module doit poster"}},[n("b-form-radio-group",{attrs:{options:t.textOptions,stacked:""},model:{value:t.form.textChannel,callback:function(e){t.$set(t.form,"textChannel",e)},expression:"form.textChannel"}})],1)],1),t._v(" "),n("b-tab",{attrs:{title:"Canaux (texte)",disabled:!t.channelTypes.textChannels}},[n("b-form-group",{attrs:{label:"Sélectionne sur quels canaux textuels le module doit poster"}},[n("b-form-checkbox-group",{attrs:{options:t.textOptions,switches:"",stacked:""},model:{value:t.form.textChannels,callback:function(e){t.$set(t.form,"textChannels",e)},expression:"form.textChannels"}})],1)],1),t._v(" "),n("b-tab",{attrs:{title:"Canal (voix)",disabled:!t.channelTypes.voiceChannel}},[n("b-form-group",{attrs:{label:"Sélectionne sur quel canal vocal le module doit poster"}},[n("b-form-radio-group",{attrs:{options:t.voiceOptions,stacked:""},model:{value:t.form.voiceChannel,callback:function(e){t.$set(t.form,"voiceChannel",e)},expression:"form.voiceChannel"}})],1)],1),t._v(" "),n("b-tab",{attrs:{title:"Canaux (voix)",disabled:!t.channelTypes.voiceChannels}},[n("b-form-group",{attrs:{label:"Sélectionne sur quels canaux vocaux le module doit poster"}},[n("b-form-checkbox-group",{attrs:{options:t.voiceOptions,switches:"",stacked:""},model:{value:t.form.voiceChannels,callback:function(e){t.$set(t.form,"voiceChannels",e)},expression:"form.voiceChannels"}})],1)],1)],1)],1),t._v(" "),n("b-row",[n("b-col",[n("b-button",{attrs:{type:"submit",block:"",variant:"primary"}},[t._v("Appliquer les modifications")])],1),t._v(" "),n("b-col",[n("b-button",{attrs:{block:"",variant:"secondary"},on:{click:function(e){return t.setDefaultValues()}}},[t._v("Annuler les modifications")])],1)],1)],1)],1):t._e()},[],!1,null,null,null).exports,main=n(135),m={name:"modules",fetch:function(t){var e=t.store,n=t.redirect;return e.state.auth.isAuth&&e.state.auth.hasAccess?void 0:n("/")},head:function(){return{titleTemplate:"%s - "+this.title}},data:function(){return{title:"Administration: Modules",modulesData:[],fields:[{key:"name",label:"Module",sortable:!0,thStyle:{width:"80%"}},{key:"enabledCheckBox",label:"Activé",sortable:!0,thStyle:{width:"20%"}}],totalRows:1,currentPage:1,perPage:10,pageOptions:[5,10,15],restarting:!1,restartVariant:"primary"}},asyncData:function(){var t=Object(o.a)(regeneratorRuntime.mark(function t(e){var n,data,o;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return n=e.$axios,t.prev=1,t.next=4,n.$get("modules");case 4:return data=t.sent,o=data.map(function(t){return Object(r.a)({},t,{key:"".concat(t._id,"/").concat(t.revision)})}),t.abrupt("return",{modulesData:o});case 9:t.prev=9,t.t0=t.catch(1);case 11:case"end":return t.stop()}},t,null,[[1,9]])}));return function(e){return t.apply(this,arguments)}}(),mounted:function(){this.$store.dispatch("breadcrumbs/setCrumbs",this.$route.path),this.$store.dispatch("botinfo/getInfo"),this.totalRows=this.modulesData.length},methods:{submitUpdate:function(){var t=Object(o.a)(regeneratorRuntime.mark(function t(e,data){var n,o;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,this.$axios({method:"patch",data:data,url:"modules/"+e});case 3:if(0!==t.sent.data.modifed){t.next=8;break}this.$toast.warning("Aucune modification"),t.next=21;break;case 8:return this.$toast.success("Module modifié"),t.prev=9,t.next=12,this.$axios.$get("modules");case 12:n=t.sent,o=n.map(function(t){return Object(r.a)({},t,{key:"".concat(t._id,"/").concat(t.revision)})}),this.modulesData=o,this.totalRows=this.modulesData.length,t.next=21;break;case 18:t.prev=18,t.t0=t.catch(9),this.$axiosGetErrorHandler(t.t0);case 21:t.next=26;break;case 23:t.prev=23,t.t1=t.catch(0),this.$axiosPostErrorHandler(t.t1,"Module non trouvé","Ce module existe déjà","Erreur avec l'édition du module");case 26:case"end":return t.stop()}},t,this,[[0,23],[9,18]])}));return function(e,n){return t.apply(this,arguments)}}(),toggleEnabled:function(t,e){e?this.submitUpdate(t,{enabled:!1}):this.submitUpdate(t,{enabled:!0})},restartDerpy:function(){var t=Object(o.a)(regeneratorRuntime.mark(function t(){var e=this;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,this.restarting=!0,t.next=4,this.$axios.$get("system/restart");case 4:t.sent,this.restarting=!1,this.restartVariant="success",Object(main.setTimeout)(function(){return e.restartVariant="primary"},3e3),t.next=15;break;case 10:t.prev=10,t.t0=t.catch(0),this.restarting=!1,this.restartVariant="danger",Object(main.setTimeout)(function(){return e.restartVariant="primary"},3e3);case 15:case"end":return t.stop()}},t,this,[[0,10]])}));return function(){return t.apply(this,arguments)}}()},components:{moduleConfiguration:h}},d=Object(c.a)(m,function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("b-jumbotron",{staticClass:"mt-3 mb-3 pt-4 pb-4",attrs:{fluid:"","bg-variant":"dark","text-variant":"light",header:"Administration: Modules",lead:"Configuration générique des modules."}}),t._v(" "),n("b-container",[n("b-breadcrumb",{attrs:{items:t.$store.state.breadcrumbs.crumbs}})],1),t._v(" "),n("b-container",{staticClass:"pb-5"},[n("b-table",{attrs:{hover:"","head-variant":"light","current-page":t.currentPage,"per-page":t.perPage,items:t.modulesData,fields:t.fields},scopedSlots:t._u([{key:"enabledCheckBox",fn:function(e){return[n("b-form",[n("b-form-checkbox",{attrs:{name:"check-button",switch:""},on:{change:function(n){return t.toggleEnabled(e.item.name,e.item.enabled)}},model:{value:e.item.enabled,callback:function(n){t.$set(e.item,"enabled",n)},expression:"row.item.enabled"}})],1)]}}])}),t._v(" "),n("b-row",[n("b-col",[n("b-pagination",{staticClass:"my-0",attrs:{"total-rows":t.totalRows,"per-page":t.perPage},model:{value:t.currentPage,callback:function(e){t.currentPage=e},expression:"currentPage"}})],1),t._v(" "),n("b-col",[n("b-form-group",{staticClass:"mb-0",attrs:{"label-cols-sm":"3",label:"Nombre par page"}},[n("b-form-select",{attrs:{options:t.pageOptions},model:{value:t.perPage,callback:function(e){t.perPage=e},expression:"perPage"}})],1)],1)],1),t._v(" "),n("hr",{staticClass:"border-primary"}),t._v(" "),n("p",[t._v("Pour activer/désactiver les modules il faut redémarrer Derpy.")]),t._v(" "),n("b-button",{attrs:{block:"",variant:t.restartVariant},on:{click:function(e){return t.restartDerpy()}}},[t.restarting?n("b-spinner",{attrs:{small:""}}):n("span",[t._v("Redémarrer Derpy")])],1)],1),t._v(" "),t._l(t.modulesData,function(e){return n("moduleConfiguration",{key:e.key,attrs:{data:e},on:{submitUpdate:t.submitUpdate}})})],2)},[],!1,null,null,null);e.default=d.exports}}]);