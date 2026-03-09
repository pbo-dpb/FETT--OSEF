import { defineStore } from "pinia";
import aggregationPayloadUrl from "../assets/composition.json?url";
import departmentsPayloadUrl from "../assets/departments.json?url";
let departmentsEagerPayloadsUrls = {};
let dptUrls = import.meta.glob("../assets/departments/*.json", {
  query: "?url",
  import: "default",
  eager: true,
});
Object.keys(dptUrls).forEach((key) => {
  const url = dptUrls[key];
  departmentsEagerPayloadsUrls[
    key.replace("../assets/departments/", "").replace(".json", "")
  ] = url;
});

export default defineStore("payloads", {
  state: () => ({
    departments: false,
    composition: false,
    loading: [],
  }),
  actions: {
    async fetchComposition() {
      if (this.loading.includes("composition")) return;
      this.loading.push("composition");

      const response = await fetch(aggregationPayloadUrl);
      const data = await response.json();

      // Temporarely do both assigments in the same round
      this.composition = data;

      this.loading = this.loading.filter((item) => item !== "composition");
    },

    async fetchDepartments() {
      if (this.loading.includes("departments")) return;
      this.loading.push("departments");

      const response = await fetch(departmentsPayloadUrl);
      const data = await response.json();

      this.departments = data.map((dept) => {
        dept.url = departmentsEagerPayloadsUrls[dept.id];
        return dept;
      });

      this.loading = this.loading.filter((item) => item !== "departments");
    },

    async eagerLoadDepartment(departmentId) {
      if (this.departments === false) {
        await this.fetchDepartments();
      }

      let departmentObject = this.departments.find(
        (dept) => dept.id === departmentId,
      );

      if (!departmentObject) {
        throw new Error(`Department with ID ${departmentId} not found`);
      }

      if (!departmentObject.eagerLoaded) {
        const response = await fetch(departmentObject.url);
        const data = await response.json();

        Object.assign(departmentObject, data);
        departmentObject.eagerLoaded = true;
      }

      return departmentObject;
    },
  },
});
