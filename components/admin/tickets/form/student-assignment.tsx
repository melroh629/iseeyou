import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Student } from './types'

interface StudentAssignmentProps {
  students: Student[]
  selectedStudents: string[]
  toggleStudent: (studentId: string) => void
  toggleAllStudents: () => void
}

export function StudentAssignment({
  students,
  selectedStudents,
  toggleStudent,
  toggleAllStudents,
}: StudentAssignmentProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">14. 수강생 할당 (선택사항)</CardTitle>
          {students.length > 0 && (
            <button
              type="button"
              onClick={toggleAllStudents}
              className="text-sm text-primary hover:underline"
            >
              {selectedStudents.length === students.length ? '전체 해제' : '전체 선택'}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          수강생을 선택하지 않으면 미할당 수강권으로 생성됩니다. 나중에 수강권 관리 페이지에서 수강생에게 할당할 수 있습니다.
        </p>
        <div className="border rounded-lg max-h-[300px] overflow-y-auto">
          {students.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              등록된 수강생이 없습니다
            </p>
          ) : (
            <div className="divide-y">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 hover:bg-accent transition-colors"
                >
                  <Checkbox
                    id={student.id}
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={() => toggleStudent(student.id)}
                  />
                  <label
                    htmlFor={student.id}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{student.users.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.users.phone}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedStudents.length > 0 && (
          <p className="text-sm text-muted-foreground mt-3">
            {selectedStudents.length}명 선택됨
          </p>
        )}
      </CardContent>
    </Card>
  )
}
