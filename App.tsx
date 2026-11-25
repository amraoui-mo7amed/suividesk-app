import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Employee, TaskItem, MainTab, SecurityState } from './src/types';
import {
  getEmployees,
  getTasks,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  createTask,
  updateTask,
  deleteTask,
  getSecurity
} from './src/services/storage';

import { Header } from './src/components/Header';
import { BottomNav } from './src/components/BottomNav';
import { AboutModal } from './src/components/AboutModal';
import { LockScreen } from './src/components/LockScreen';
import { EmployeeModal } from './src/components/EmployeeModal';
import { TaskModal } from './src/components/TaskModal';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { SuiviScreen } from './src/screens/SuiviScreen';
import { EmployeeDetailsScreen } from './src/screens/EmployeeDetailsScreen';
import { SyncScreen } from './src/screens/SyncScreen';
import { SecurityScreen } from './src/screens/SecurityScreen';
import { COLORS } from './src/constants/theme';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainTab>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Security / App Lock
  const [security, setSecurity] = useState<SecurityState>({ enabled: false, autoLockMinutes: 0 });
  const [isLocked, setIsLocked] = useState(false);
  const lastActiveTimestamp = useRef<number>(Date.now());

  // Modals
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskTargetEmployeeId, setTaskTargetEmployeeId] = useState<number | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [empList, taskList, sec] = await Promise.all([
        getEmployees(),
        getTasks(),
        getSecurity()
      ]);
      setEmployees(empList);
      setTasks(taskList);
      setSecurity(sec);
      if (sec.enabled) {
        setIsLocked(true);
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Auto-lock on app state change (inactivity)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (security.enabled && security.autoLockMinutes > 0) {
          const elapsedMinutes = (Date.now() - lastActiveTimestamp.current) / (1000 * 60);
          if (elapsedMinutes >= security.autoLockMinutes) {
            setIsLocked(true);
          }
        }
        lastActiveTimestamp.current = Date.now();
      } else {
        lastActiveTimestamp.current = Date.now();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [security]);

  // Employee actions
  const handleSaveEmployee = async (civilite: string, fullName: string) => {
    if (employeeToEdit) {
      await updateEmployee(employeeToEdit.id, { civilite, full_name: fullName });
    } else {
      await createEmployee({ civilite, full_name: fullName });
    }
    await loadData();
  };

  const handleDeleteEmployee = async (emp: Employee) => {
    await deleteEmployee(emp.id);
    if (selectedEmployeeId === emp.id) {
      setSelectedEmployeeId(null);
    }
    await loadData();
  };

  // Task actions
  const handleSaveTask = async (taskData: Partial<TaskItem>) => {
    if (taskToEdit) {
      await updateTask(taskToEdit.id, taskData);
    } else {
      await createTask(taskData);
    }
    await loadData();
  };

  const handleDeleteTask = async (task: TaskItem) => {
    await deleteTask(task.id);
    await loadData();
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const employeeTasks = selectedEmployeeId
    ? tasks.filter((t) => t.agent_id === selectedEmployeeId)
    : [];

  const taskModalAgent = selectedEmployee
    ? selectedEmployee
    : employees.find((e) => e.id === taskTargetEmployeeId) || employees[0];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />

        {/* Global Header */}
        <Header onOpenAbout={() => setIsAboutOpen(true)} />

        {/* Screen Content */}
        <View style={styles.screenContainer}>
          {selectedEmployee ? (
            <EmployeeDetailsScreen
              employee={selectedEmployee}
              tasks={employeeTasks}
              onBack={() => setSelectedEmployeeId(null)}
              onAddTask={() => {
                setTaskToEdit(null);
                setTaskTargetEmployeeId(selectedEmployee.id);
                setIsTaskModalOpen(true);
              }}
              onEditTask={(task) => {
                setTaskToEdit(task);
                setTaskTargetEmployeeId(selectedEmployee.id);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
            />
          ) : currentTab === 'dashboard' ? (
            <DashboardScreen
              employees={employees}
              tasks={tasks}
              onSelectEmployee={(id) => setSelectedEmployeeId(id)}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          ) : currentTab === 'suivi' ? (
            <SuiviScreen
              employees={employees}
              onSelectEmployee={(id) => setSelectedEmployeeId(id)}
              onAddEmployee={() => {
                setEmployeeToEdit(null);
                setIsEmpModalOpen(true);
              }}
              onEditEmployee={(emp) => {
                setEmployeeToEdit(emp);
                setIsEmpModalOpen(true);
              }}
              onDeleteEmployee={handleDeleteEmployee}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          ) : currentTab === 'sync' ? (
            <SyncScreen onSyncComplete={loadData} />
          ) : (
            <SecurityScreen onSecurityUpdated={loadData} />
          )}
        </View>

        {/* Bottom Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
          onChangeTab={(tab) => {
            setSelectedEmployeeId(null);
            setCurrentTab(tab);
          }}
          isPasswordConfigured={security.enabled}
          onLockApp={() => setIsLocked(true)}
        />

        {/* Modals */}
        <AboutModal visible={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

        <EmployeeModal
          visible={isEmpModalOpen}
          employeeToEdit={employeeToEdit}
          onClose={() => {
            setIsEmpModalOpen(false);
            setEmployeeToEdit(null);
          }}
          onSave={handleSaveEmployee}
        />

        {isTaskModalOpen && taskModalAgent && (
          <TaskModal
            visible={isTaskModalOpen}
            taskToEdit={taskToEdit}
            agentId={taskModalAgent.id}
            agentName={taskModalAgent.full_name}
            onClose={() => {
              setIsTaskModalOpen(false);
              setTaskToEdit(null);
              setTaskTargetEmployeeId(null);
            }}
            onSave={handleSaveTask}
          />
        )}

        {/* Full-Screen Institutional Lock Overlay */}
        {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.bg
  }
});
