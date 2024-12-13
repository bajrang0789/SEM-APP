<template>
  <v-container fluid class="pt-2" height="100%">
    <v-row class="fill-height" align="stretch">
      <v-col cols="6">

        <v-card class="fill-height bg-color rounded-lg" variant="flat" title="By Category">
          <v-skeleton-loader :loading="loadingChart" class="mx-auto border" type="image, article,image">
            <v-card-text>
              <PieChart :chartData="pieChartData              " />
            </v-card-text>
          </v-skeleton-loader>
        </v-card>

      </v-col>
      <v-col cols="6">
        <v-card class="fill-height bg-color rounded-lg" variant="flat" title="Last week expenses">

          <v-skeleton-loader :loading="loadingChart" type="image, article, image">
            <v-card-text>
              <BarChart :categories="barChartDay" :seriesData="barChartAmount" />
            </v-card-text>
          </v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import PieChart from './PieChart.vue';
import BarChart from './BarChart.vue';
import axios from 'axios';
interface Expense {
  title?: string,
  amount?: string,
  date?: string,
  tags?: string[],
  category?: string,
  isAddExpense?: boolean
}
const loadingChart = ref(true);
const pieChartData = ref<{ value: number; name: string }[]>([]);
const barChartDay = ref<string[]>([]);
const barChartAmount = ref<number[]>([]);
const getAllExpenses = async () => {
  barChartDay.value = getLastWeekLabels();
  const response = await axios.get('https://smart-expense-manager-410654816815.us-central1.run.app/get-expense');
  const expenses: Expense[] = response.data;
  barChartAmount.value = filterLastWeekSum(expenses);
  pieChartData.value = expenses.map((item) => ({
  value: parseFloat(item.amount || '0'), 
  name: item.category || 'Unknown'
}));
  loadingChart.value = false;
}
const getLastWeekLabels = () => {
  const days = [];
  const options: Intl.DateTimeFormatOptions = { weekday: 'short' };

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', options));
    }

    return days;
};
const filterLastWeekSum = (expenses:Expense[]) =>{
  const last7Days = getLastWeekLabels();
    const result = last7Days.map(day => {
        let sum = 0;
        expenses.forEach(expense  => {
          if (expense.date && expense.amount !== undefined) {
                const itemDate = parseDate(expense.date);
                if (!itemDate) return; 

                const expenseDay = itemDate.toLocaleDateString('en-US', { weekday: 'short' });
                if (expenseDay === day) {
                  const amount = parseInt(expense.amount, 10); 
                    if (!isNaN(amount)) {
                        sum += amount;
                    }
                }
            }
            
        });
        return sum;
    });

    return result;
}

const parseDate = (date:string) => {
  if (/\d{2}-[A-Za-z]{3}-\d{2}/.test(date)) {
        return new Date(date.replace(/-/g, " ")); // Replace dashes with spaces for parsing
    }

    // Handle "13/03/24 15:21" format
    if (/\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}/.test(date)) {
        const [datePart, timePart] = date.split(" ");
        const [day, month, year] = datePart.split("/");
        const [hours, minutes] = timePart.split(":");
        return new Date(`20${year}-${month}-${day}T${hours}:${minutes}:00`); // Convert to ISO format
    }

    return null; 
};
getAllExpenses();
</script>
<style scoped>
.full-height {
  height: 100%;
}

.bg-color {
  background-color: rgb(245, 243, 239) !important;
  color: rgb(0, 0, 0) !important;
  caret-color: rgb(0, 0, 0) !important;
}
</style>
